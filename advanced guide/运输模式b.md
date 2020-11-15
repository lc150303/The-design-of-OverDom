<img align="middle" src="./imgs/title.png">
  
QQ群：565401831  
游戏介绍及入手请移步：[hoho大佬简书教程](https://www.jianshu.com/p/5431cb7f42d3)  
[系列目录](https://zhuanlan.zhihu.com/p/104412058)  
Version：1.0  
Author：Scorpior

# Screeps 运输模式（二）任务模式
<img align="middle" src="./imgs/trans0.png" width=300>

## 引言
Screeps 中绝大多数物资运输都要依靠 creeps 完成，如何灵活地完成采矿、升级、factory、lab 
等的物资运输需求是一个极其有趣的设计难题。  

本文介绍一种有效**结合了高效（特化）与灵活**的实现方案。

### 预备知识
#### 同时动作 
Screeps 中你每 tick 可以调用 creep 执行一些动作，需要了解的是你的代码在调用 api 时只是告诉了服务器**你想做什么**，比如你想 
withdraw 一些资源，返回值为 *OK* 常量只意味着服务器成功记录了你想做 withdraw，下一
tick 你取的资源才会出现在 creep 身上。根据[官方docs](https://screeps-cn.github.io/simultaneous-actions.html)的介绍，有些动作是可以在同一 
tick 中同时执行的。其中移动类动作 move、moveTo、moveByPath 
是可以和任意的非移动类动作同时执行，也就意味着你可以在调用 withdraw 或 transfer 返回 OK 的同一 
tick 开始移动，而不用等待下一 tick 身上资源数量改变。

#### 角色驱动与任务驱动
hoho大佬已经[解释了缘由啦](https://www.jianshu.com/p/7226e08c4b8e)。

## 初步
在角色驱动的 creep 逻辑中，creep 需要每tick遍历查找各种建筑来判断需不需要工作，这里其实存在一种 cpu
浪费。以用 link 将 source 处采集的能量传回 storage 存放为例，平时大多数 tick 中矿点的 link 都是在默默等待矿机（挖矿的 
creep）将能量放进去，这个时候等在 storage 附近的运输型 creep 就没必要每 tick 去判断 storage 旁边的 link 
需不需要搬出能量。在矿点 link 装满后，你的程序有一个地方会使用```link.transferEnergy()```函数将能量传回
storage 旁边的 link，那么能不能此时在这个逻辑中顺便通知运输型 creep 该开始工作了呢？通过任务机制，我们可以实现这样的**信息传递**。

link 要通知 creep 的话，肯定要传递一些数据或者调用一些函数，如果在 link 代码中调用 creep 
的函数会让程序逻辑非常复杂，而且多个建筑同时工作时容易互相干扰，因此选择传递一些数据是更加明晰的做法。我们把传递的数据称为**任务**，link
创建这些数据的动作称为**发布**任务。直观地，我们可以在任务中记录这些数据：
```js 
let link的任务 = {
    从: storage旁边的link,
    把: RESOURCE_ENERGY,
    搬到: storage
};
```
然后我们需要一个缓存池来存放这些任务，简单起见就用 JS 里的数组（我习惯用[全局缓存](https://github.com/lc150303/The-design-of-OverDom/blob/master/advanced%20guide/存储机制.md#邪教)，你也可以用 [Memory](https://github.com/lc150303/The-design-of-OverDom/blob/master/advanced%20guide/存储机制.md#正道)）：
```js 
// 在初始化代码中
global.某个房间的任务缓存池 = [];  // 新建一个数组

// 在工作代码中
某个房间的任务缓存池.push(link的任务);   // 把上面那个任务放进缓存池
```
如果所有的运输工作都以任务方式进行，那么我们的运输型 creep 要做的就是每 tick 监控```某个房间的任务缓存池.length```，通过这一个变量就可以知道有没有任何一个建筑需要搬运物资，比遍历不同种类的建筑省很多语句。
```js 
var 正在执行的任务 = undefined;    // 用了局部缓存，需要注意避免多个 creep 互相冲突

function work(creep) = {
    if (!正在执行的任务) {      // 目前没有任务
        if (某个房间的任务缓存池.length) {    // 任务池里有任务
            正在执行的任务 = 某个房间的任务缓存池.shift();   // 取出一个任务，也可以把 shift 换成 pop
        }
    }
    if (正在执行的任务) {      // 目前有任务或者刚拿到任务
        /**
         * 用状态机代码去 
         * 正在执行的任务.从 
         * 把 
         * 正在执行的任务.把 
         * 运到 
         * 正在执行的任务.搬到
         */
    }
}
```
这样我们的 creep 在没有工作时非常省 cpu，在工作中因为任务已经指明了从哪搬到哪，也**不需要再有更多的遍历判断**。而不同建筑发布任务时只需要将对应的建筑和资源类型替换一下，**按相同格式发布在任务缓存池**就可以有
creep 执行对应的运输工作，**非常容易增加新的建筑和新的任务**。
## 完善
上面我们的 link 是在调用```link.transferEnergy()```这个函数时发布任务，逻辑写好就不会发布重复任务。然而假如在 controller 旁边的 link 缺能量了，我们需要从
storage 把能量搬到 storage 旁边的 link 然后发送过去，我们的逻辑就可能大概是这样：
```js 
if (controller旁边的link.store[RESOURCE_ENERGY] == 0) {
    if (storage旁边的link.store[RESOURCE_ENERGY]) {
        storage旁边的link.transferEnergy(controller旁边的link);
    } else {
        某个房间的任务缓存池.push({
            从: storage,
            把: RESOURCE_ENERGY,
            搬到: storage旁边的link
        });
    }
}
```
细心可以发现，因为 creep 可能要好几 tick 才能完成任务把能量放在 storage 旁边的 link 里，上面这个逻辑会在任务完成前的每个 
tick 都重复发布一次任务，这可要引起混乱了。所以我们需要增加一个变量记录有没有发布任务，简单修改可以成这样：
```js 
var controller旁边的link发布了任务 = false;   // 初始化代码设置局部缓存变量

function 管理升级(){    // 工作代码，被 main.js 中的 module.exports.loop 调用
    if (controller旁边的link.store[RESOURCE_ENERGY] == 0) {
        if (storage旁边的link.store[RESOURCE_ENERGY]) {
            storage旁边的link.transferEnergy(controller旁边的link);
            controller旁边的link发布了任务 = false;  // 下次缺能量时还可以发布任务
        } else if (!controller旁边的link发布了任务) {   // 目前没有发布任务
            某个房间的任务缓存池.push({
                从: storage,
                把: RESOURCE_ENERGY,
                搬到: storage旁边的link
            });
            controller旁边的link发布了任务 = true;  // 已经发布了任务，暂时就不要再发啦
        }
    }
}
```
类似这样子我们就可以控制每个建筑不会发布重复任务，当然具体的变量维护需要进一步完善（避免```controller旁边的link发布了任务```值为 true 但是任务数据丢失等不一致情况）

此外，上面只完成了 creep 接受任务的逻辑，creep 总不能一生只做一件事~~感动中国~~，我们其实还需要有判断任务是否完成的逻辑。
```js 
// 发布任务的代码中
let 某个任务 = {
    从: xxx,
    把: xxx,
    搬到: xxx,
    完成条件: xxx
};

// creep 代码中
function work(creep) = {
    /**
     * 接受任务的代码
     */
     
    if (正在执行的任务) {      // 目前有任务或者刚拿到任务
        /**
         * 执行任务的代码
         */
         
        if (正在执行的任务.完成条件) {
            正在执行的任务 = undefined;
        }
    }
}
```

## 优化
上面我们在 creep 中用了相同代码去完成不同的运输任务，这样的一套通用代码不一定足够高效。比如在填充 extension 时，creep 
在填完一个 extension 后身上的能量很可能还足够填下一个 extension，如果每个 extension 发布一个任务则 creep 可能会白白跑回 
storage 再取一次能量（取决于工作代码怎么写）。而如果我们要在同一个工作逻辑中增加判断 extension 
这种小量任务从而连续执行，那么在执行大批量任务时又产生了不必要的 if-else 语句开销。我们能不能针对不同的任务使用不同的逻辑呢？很好办，在任务数据中增加一项```任务.用```来指明用什么工作方式就好了。
```js 
let link的任务 = {
    从: storage旁边的link,
    用: 适合link的逻辑,
    把: RESOURCE_ENERGY,
    搬到: storage,
    完成条件: link被黄黄的填满了
};

let extension的任务 = {
    从: storage,
    用: 适合extension的逻辑
    把: RESOURCE_ENERGY,
    搬到: extension,      // 可以是 extensions，一次连续填很多个
    完成条件: extension(s)被黄黄的填满了
};
```
这样我们的运输型 creep 在工作时就可以
```js 
// 上面的取任务代码
    if (正在执行的任务) {      // 目前有任务或者刚拿到任务
        switch (正在执行的任务.用) {
            case 适合link的逻辑: {
                // 工作逻辑代码
                break;
            }
            case 适合extension的逻辑: {
                // 另一种工作逻辑代码
                break;
            }
            // 其他case
        }
        if (正在执行的任务.完成条件) {
            正在执行的任务 = undefined;
        }
    }
```
这样我们就可以在填充 extension 时用一些非常高效的代码，比如按固定路线每 tick 同时移动和 transfer，最快速度完成任务。

但是这样要增加新的建筑或者新的专用逻辑时，我们就需要修改 creep 的代码增加新的 case，非常不方便。为了把 creep 
接受任务的逻辑统一起来，我们可以把```任务.用```这一项数据换成函数，接受一个```creep```对象作为参数，内部再调用这个 creep
去执行特化的逻辑。
```js 
// 在管理 link 的代码中
let extension的任务 = {
    从: storage,
    用: function (creep) {
        // 适合extension的工作逻辑
    },
    把: RESOURCE_ENERGY,
    搬到: extension   // 可以是 extensions，一次连续填很多个
};
某个房间的任务缓存池.push(link的任务);

// 在 creep 的代码中
var 正在执行的任务 = undefined;    // 用了局部缓存，需要注意避免多个 creep 互相冲突
function work(creep) = {
    if (!正在执行的任务) {      // 目前没有任务
        if (某个房间的任务缓存池.length) {    // 任务池里有任务
            正在执行的任务 = 某个房间的任务缓存池.shift();   // 取出一个任务，也可以把 shift 换成 pop
        }
    }
    if (正在执行的任务) {      // 目前有任务或者刚拿到任务
        正在执行的任务.用(creep);
        if (任务已完成的条件) {
            正在执行的任务 = undefined;
        }
    }
}
```
这样其实```任务.从```、```任务.把```和```任务.搬到```三个变量也不需要被其他代码读到，因此可以直接省去而把实际值写死在```任务.用```的函数里，可以尝试**极致高效**。

## 延伸
在上面的例子中，一个建筑只发布一个任务，一个任务只被一个 creep 接到，因此可以很好地**让不同 creep 
同时去执行不同的任务**。但是如果我们是执行从 storage 搬到 terminal 这样的可能大批量的任务，只有一个 
creep 去搬可能较慢，我们想让多个 creep 同时去搬也很方便——一次性发布多个任务即可。相应地我们需要把记录任务是否已发布的变量从布尔值改成整数值，还可以在任务数据中增加记录每个任务需要运输的资源量。

上面我们采取数组的 shift() 或 pop() 函数取出任务，这相当于用数组位置作为任务的优先级，也可以实现其他优先级机制。