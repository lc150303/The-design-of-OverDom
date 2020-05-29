# 史诗级智慧物流系统【设计】
Epic smart logistics system   

## 需求
用**最少的 creep**、**最少的时间（tick）**和**最少的 intents cpu**完成房内的和外矿的资源运输需求。因为最少的时间和最少的 intents cpu 意味着正在工作的 creep 的工作能力被最大化利用，自然就节约了 creep，因此算法目标只需要优化这两者。

在最优化上述3个目标之余，**还需兼容优先级设置和需求变更**，即紧急任务要尽量早完成、某个点的运输需求可能在未来任何时间增加或减少。

情景举例：

1. creep1 正在把 mineral 运回 storage，距离终点还差2格，其他 creep 都空闲但是在远处。现在出现了从 storage 运输能量到 powerSpawn 的需求，此需求**应该分配给 creep1 等它放下 mineral 后执行**。
2. 从 lab 回收化合物，最后剩3个 lab 各有500、600、700点化合物，lab 相互之间的路程远小于 lab 到 storage 的路程。运输工的容量是1000，**应该用2趟运回化合物**，比如一趟 500+500，一趟 100+700。
3. source 处的 link 把能量传回 storage 旁的 link，此时有填充 extension 的需求，不应该把 link 中的能量放进 storage 再从 storage 中取能量填 extension，**应该拿着 link 中的能量直接去填 extension**。

注：本身多个源、多个汇、多个 creep 的互相匹配就是一个不小的问题了，再加上不同的资源种类与数量，再对源、汇、creep 都加上时间约束，整个问题难得令人发指，全局算法过于难设计，先用个贪心策略解决问题。

## 基础工具   
### timer   
事件链中的计时器，是一个`{}`，以 tick 数字作为入口，每个 tick 对应一个数组存放此 tick 要做的事情。每 tick 会取出当前需要做的事情来处理。
```js
if (Game.time in timer) {
	for (let event of timer[Game.time]) {
		event.invoke();
	}
	delete timer[Game.time]; // 防内存泄露
}
```

### 需求登记
各房间独自规划运输工作，所以运输需求也分房间登记。登记方式按照[流模式](https://github.com/lc150303/The-design-of-OverDom/blob/master/advanced%20guide/%E8%BF%90%E8%BE%93%E6%A8%A1%E5%BC%8Fa.md)中将源和汇区分开，storage 和 terminal 作为最后考虑的（优先级最低）的源与汇。
```js
sourceNodes[RESOURCE_ENERGY].push({
	id: container.id,
	pos: container.pos,
	amount: x,
	startTime: t0,  // 这个点可以被取出资源的时间，比如 lab 和 factory 反应完成时间
	endTime: t1,    // 这个点必须被取出资源的时间，比如 link 和 container 为了不卡住挖矿速度
	priority: L1    // 自己设置的优先级常数
});
// ...
targetNodes[RESOURCE_POWER].push({
	id: powerSpawn.id,  
	pos: powerSpawn.pos,
	amount: y,
	startTime: t0,  // 这个点可以被放入资源的时间，比如下一批 lab、factory 反应
	endTime: t1,    // 这个点必须被填满的时间，比如 boost 不能一直拖
	priority: L2
});
```
同一个任务的多个需求需要挂钩，后面发现某个资源不足时取消整个任务，不过尽量通过全局资源总数统计来保证发布任务时就安排好资源数量，尽量避免已发布任务互相竞争。

### 移动优化   
通过路径缓存来复用`findClosestByPath()`中的路径，配合物流系统内对路径长度的进一步缓存，极大降低对缓存位置使用`findClosestByPath()`函数的开销。通过对穿等方式解决 creep 互相堵路的问题，使得其他功能算法中不用考虑堵路造成过长的延迟（影响对运输时间的预期）。

## 情况分类
### 室内与室外
室内主要指的是占领的房间和外矿的运输工作，严格标准是按有没有 road 划分。有 road 的运输工只需要带一半 MOVE，不适合被派去运 deposit 或者 pb，所以按 MOVE 比例将两类运输工作隔离开。物流调度算法只需要考虑**单一占领房间及其外矿的运输工作**，既不同的已占领房间分别处理。

### 一趟运输中情况分类
一趟运输指的是“去源取再到汇放”的整个过程，仅有起始时和终末时 creep 身上为空，中间一旦拿起某些资源后就不再出现身上为空的情况。   
1. 单源单汇单类型：  
比如 link 与 storage 之间的转运，一些 storage 与 terminal 之间的转运等。
2. 单源单汇多类型：  
一些 storage 与 terminal 之间的转运，boost 时填 lab， 填 nuker 等。**以建筑为基础概念安排的时候比较方便做这个**。
3. 单源多汇：  
填 lab，填 extension， 填塔等。
1. 多源单汇：  
收集 lab 产物，清理 container 和捡垃圾等。
2. 多源多汇单类型：  
link 加 storage 填 extension，或者 storage 加 terminal 填 lab。**以资源类型为基础概念比较方便做这个**。
3. 多源多汇多类型：  
通常是因为涉及捡垃圾 or 涉及 lab。好烦啊，**选择性放弃**。

## 完整算法
通过带时间信息的物流需求登记，我们可以获得未来较长（几百~几千）tick 的大部分资源运输需求，但是在权衡下面3个因素后放弃一次性安排好所有已知任务。
1. invader、新 powerBank 以及战争等会经常带来突发运输需求，还可能有某些任务取消导致的需求变更，如果一次性安排好成百上千 tick 的运输路径后中间发生需求变更，则修改路径时需要**重新推算后续整条路径**的时间是否合理。而且因为一次性安排好所有任务是为了追求全局最优，为了保持全局最优可能**要把变更时间之后的所有其他路径都调整一遍**，浪费了之前的计算开销。如果需求变更后为了减小开销只考虑一条路径，则又意味着放弃了全局最优，那还不如一开始就不追求全局最优。
2. 追求全局最优的很多算法，比如邻域搜索和 saving 算法，都是要跑一个`while`循环，在时间达到设定的上限或者优化达到阈值后跳出，这种反复循环在 screeps 中太奢侈了。
3. screeps 中运输任务**有较好的结构性**，比如同时作为源和汇的建筑主要只有核心区的 storage、terminal、factory，以及 lab 集群，这两个集群因为内部距离近或者建筑需求类似而经常可以分别视为单一 pos，其他建筑也有各自特征。这些特征让我们可以对贪心算法作特定优化，使得调度结果的时间性价比不亚于全局优化。相对而言，不具备长期结构的捡 tomb 和回收 ruin 之类的情况极少发生，放弃通用算法对它们的优化，基本可以接受。

上述权衡在一些条件下可能失效，比如通过优异的 AI 提前减少了需求变更频率、或者在游戏问题中用`while`循环实际开销不大，那么全局规划算法可能更好。

此次设计的贪心算法由三个步骤构成，分别是源汇配对、creep 分配和路线合并。

### 源汇配对
算法假设从 global reset 后开始，当前 creep 散布于房间任意位置，并且身上不一定为空。身上有资源的 creep 一律以当前位置注册为源。

在前面的资源登记中我们已经把每种资源类型的运输需求全收集到位，下一步就要决定每个取出或放入的需求的另一头需要与哪个建筑的放入或者取出配对，原则就是**将最近的源和汇配对**以及**非库存优先**。库存指的是把 storage 和 terminal 中闲置资源当做源、把这俩的空闲容量当做汇。

只从所有的源或只从所有的汇去用`findClosestByPath()`，会因为遍历的先后顺序差异而陷入劣解，比如：设A、B是相同类型源，C、D是对应类型的汇，A到C、D的路程分别是 **10** 和 **11**，B到C、D的路程分别是 **2** 和 **12**，如果遍历`[A,B]`去匹配汇，则会把A匹配给C，B只剩下D可用，总路程 10+12 = 22，但如果遍历`[B,A]`会得到总路程 2+11 = 13 的结果。

稳定解用 [OverMind](https://github.com/bencbartlett/Overmind/wiki/The-Logistics-System) 中用过的 Gale-Shapley 算法得到，这个算法可以百度看解释。

#### 算法流程
1. 把源按优先级排降序，汇按优先级排降序，这一步其实在需求登记时就排好了，不包括库存。
1. 从优先级高到低遍历源，每个源配给它最近的汇：
    ```js 
    for (let source of sortedSources) {
        let closestTarget = source.pos.findClosestByPath(sortedTargets);
        closestTarget.nearSources.push(source);
    }
    ```
1. 从优先级高到低遍历汇，每个汇在配给它的源中选择最近的：
    ```js 
    for (let target of sortedTargets) {
        while(target.amount > 0 && target.nearSources.length > 0) {
            let closestSource = target.pos.findClosestByPath(target.nearSources);
            update(sortedTargets, sortedSources, target, closestSource);    // 成功配对的源和汇要互相继承时间约束
        }
    }
    ```
    这里一旦选出`closestSource`就是匹配成功，要按照需求量更新`sortedTargets`和`sortedSources`。
1. 循环步骤2和步骤3，跳出循环时剩下的找库存：
    ```js 
    for (let type of registeredTypes) {
        while(sortedSources.length >0 && sortedTargets.length > 0) {
            do2();
            do3();
        }
        if(sortedSources.length > 0) {
            toStorage(sortedSources);   // 继承每个源的时间约束
        } else if (sortedTargets.length > 0) {
            fromStorage(sortedTargets); // 继承每个汇的时间约束
        }
    }
    ```

要考虑资源取放时间的话，这里的`sortedSources`和`sortedTargets`互相挑选最近时要考虑对方是否在服务窗口内，即计算路程时有
```js 
if (!allowedTime(source, target)) {
    return Infinity;
}
```

#### 目标耗时
绝大多数资源类型，比如 power、deposit 系列商品、t3 boost，都只有唯一的源或唯一的汇，这个匹配算法只循环一次就返回。算上 energy 和低级矿物，我们**争取**平均到每种资源类型上的运行时间是 0.01 ~ 0.015 CPU，每个房间的源汇匹配总共在 0.1 ~ 0.15 CPU 内完成。

对于只有1个或0个源或汇的资源类型，也可以单独用`if-else`处理，写的好的话会更快。

#### 目标频率
高层规划时间越长、局势越和平等则规划频率越低，固有频率是高层规划的频率（下发新任务），再考虑由于外矿 invader 和过道新资源等带来不可预计的突发事件，预期调用频率是**每数百到上千 tick 计算一次**。最差情况也尽量控制在 50 tick 重算一次，因为太频繁的话 creep 一趟没跑完就更改目标可能会浪费。

#### 运行结果
之前我们登记的是运输需求，成功匹配的结果可以被视为**运输任务**，每个运输任务都指定了源位置、汇位置和资源类型，并且继承了源和汇的时间窗约束及优先级（取二者中最高）。需求登记时我们按资源类型组织，源汇配对完成后按 pos （位置）进行组织。
```js
// 源数组内每个元素具有互不相同的 pos，并记录了所有从这个 pos 取资源的汇
let matchedSources = [{pos, assignedTargets}, ...];     

// 汇数组内也是每个元素唯一 pos，并记录了所有运资源来这个 pos 的源
let matchedTargets = [{pos, assignedSources}, ...];     
```
无法被满足的源或者汇不会被登记到这两个数组。`assignedTargets`和`assignedSources`可以是以时间窗口`startTime`升序排列的数组。

### creep 分配
请系好安全带，smart 程度要提升了。

#### 数据结构
这里我们用来执行规划的是 Timer，或者说以 tick 数作为索引的`{}`。上面提到目前我们的 creep 散落在房间各处，有的还被登记为源，再加上 spawn 里正在生的和计划要生的，我们设计**两类事件**来维护 creep 状态。
1. **findTask**  
搜索源，把抵达时间或源的最早可取时间加入 Timer。  
    ```js 
    for (let source of matchedSources) {
        let time = Math.max(pathLength(creep, source), source.earliestStartTime);   // 取资源的最早可能时间
        Timer[time].push(new getTask(creep, source));   // 为getTask事件绑定creep和源
    }
    ```
2. **getTask**   
触发此事件意味着对应的一个 creep 和一个源被成功选中，creep 要**按优先级**从这个源中领取**符合时间窗口**的任务，把任务指定的资源类型送到指定的汇，然后把完成一趟运输后**预计的空闲时间登记进 Timer**。
    ```js 
    let time = timeOfGetTask + pathLength(source, target);  // 到达源的时间 + 从源到汇的时间
    Timer[time].push(new findTask(creep));      // 意味着等完成一趟运输后重新找源
    ```

#### 初始化
遍历所有存活的 creep（运输工），若身上为空则往当前时刻加入一个 **findTask** 事件，若非空则加入 **getTask** 事件。  
遍历所有计划出生的运输工，往预计出生时间加入 **findTask** 事件。

#### 循环体
从当前时刻开始遍历 Timer，触发事件。主体思想是每个空闲 creep 都以所在位置为基准，计算自己到所有源取资源所需时间，也就是对每个源登记一个 getTask 事件。把每个 creep 的取到资源的时间都登记到 Timer 以后，选取时间最早的就能成功得到一次 creep 和任务的配对。一次成功的配对（即触发 getTask 事件）意味着 creep 要从空闲位置去这个源，也就是之前登记的**从相同空闲位置到其他源的信息作废**。
```js 
for (let time in Timer) {
    for (let event of Timer[time]) {
        event.invoke();
    }
}
```
分别解释两种事件的`invoke()`。对于 findTask，它可能是为还没出生的 creep 注册的事件，也可能是算法挂起后重新执行的情况，需要检查 creep 确实存活才能尝试领取运输任务。
```js 
if (checkAlive(event.creep)) {  // 检查一下 creep 没有意外身亡
    // 搜索源，登记所有getTask事件
    for (let source of matchedSources) {
        let time = Math.max(pathLength(creep, source), source.earliestStartTime);   // 取资源的最早可能时间
        Timer[time].push(new getTask(creep, source));   // 为getTask事件绑定creep和源
    }
}
```
对于 getTask，首先要判断它有没有因为此 creep 领了同一出发时刻的其他任务而作废，其次是看源的状态有没有因为其他 creep 领取任务而更新。其他 creep 在同一个源领过任务后有三种情况：
1. 减去领走的部分后剩下的任务的开始时间仍然不晚于当前 getTask 的抵达时间，正常进行 getTask；
2. 剩下任务中最早的开始时间 t0 比抵达时间晚，则往 t0 时刻注册一个相同的 getTask 事件；
3. 不剩任何任务了，getTask 作废。

如果正常进行 getTask，要在 creep 寿命耗尽前能运到汇的任务中挑选一个，这里要综合考虑任务优先级和截止时间约束，这二者可以通过一定的策略合并成优先级。如果没有任务能在 creep 寿命耗尽前完成，则此次 getTask 作废。成功选定任务要做三件事：
1. 将同一时刻出发的其他 getTask 事件置为无效；
2. 将这个任务的剩余量减去 creep 容量；
3. 往运到汇卸货后的时间注册一个 findTask 事件。
```js 
if (event.valid) {  // 这个事件没有因为同一个 creep 领了其他任务而失效
    if (checkSource(event.source)) {    // 这里要检查源的任务是否已被领走
        let task = findCompletableTask(event.creep, event.source);  // 找一个死前能运完的最高优先级任务
        if (task) { // 找到了
            invalidate(...);    // 将其他一些getTask置为无效
            updateSource(event.source); // 更新源上的剩余任务
            let time = timeOfGetTask + pathLength(source, target);  // 到达源的时间 + 从源到汇的时间
            Timer[time].push(new findTask(creep));      // 意味着等完成一趟运输后重新找源
        }
    } else {
        updateEvent();  // 按照源的剩余任务更新事件
    }
}
```

#### 终止条件
因为不打算做全局规划，所以不等把所有任务安排完就提前停止。停止条件有三个：
1. 所有 creep 都领到了任务，则按**未来最近一次 findTask 时间**把规划算法**挂起到全局 Timer** 中，到时候再尝试规划下一批任务。这也就是前面所说的把算法挂起后重新执行的情况。这样的好处是如果有资源需求变更，下一次 findTask 时查找的就是**更新后的任务**。
2. 所有任务安排完了，碰巧比较闲，那就等待新需求唤醒规划算法，**不用**挂在全局 Timer。
3. 所有未领到任务的 creep 的所有 getTask 都**作废**或者**往后挂起**，区分一下：
    1. 某个 creep 所有的 getTask 作废，如果不是任务安排完了就是它的 ttl 太短了，那么只要其他的 creep 都领到任务就可**视为第一种情况**。
    2. 某个 creep 的所有未作废 getTask 都往后挂起了，也就是它去到目的地也要等，不如先按兵不动，把规划算法**按所有这样的 creep 的最短等待时间挂起**到全局 Timer 也等等。

#### 目标耗时

#### 目标频率

### 路线合并

## 突发情况

## 策略接口