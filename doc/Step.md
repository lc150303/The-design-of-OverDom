# 基本Step类【优化】
描述任务中一个“步骤”的基本需求和逻辑。  
目前只涉及劳动型步骤，包括运输、维修、建造。
## 思路
一个“步骤”（Step）是一个“任务”（Task）的最小组成单元，步骤中定义了具体的行为逻辑，在创建时保存行为对应的目标或者条件，执行时只需查找或者判断这一步骤特定的目标或条件，提升效率并通过组合复用提高灵活性——即虽然一个步骤可以写死来提高效率，但是一个任务可以由不同步骤组成，一个creep或者其他执行任务的对象也可以接收不同的任务，保留灵活性。  
劳动步骤可以分为 **准备（prepare）阶段** 和 **循环执行阶段**，循环执行阶段在维修和建造活动中是“取能量”和“使用能量”两个步骤循环执行，在运输活动中是“取货物”和“送货物”两个步骤循环执行。我将主要是“取”的阶段命名为 **acquire阶段**，相对的阶段称为 **perform阶段**，两个阶段分别定义成一个函数，方便针对不同需求对两个阶段的实际函数进行组合。（参考HOHO大佬[简书教程](https://www.jianshu.com/p/f61aa132d1ca)）
## 设计
* boost 活动和无需重复往返的跨房间移动都单独作为一个 step，不作为步骤中的 prepare
* 劳动步骤在第一次从任务的步骤队列中取出时，先进入prepare阶段  
    * 维修和建造：根据creep身上能量多少、与storage远近等因素判断是先进入perform还是先进入acquire，提高切换任务或切换步骤时的效率  
    * 运输：判断creep身上是否有不适合此步骤的杂物，在prepare步骤中定义清理杂物的逻辑，清理完成后类似维修和建造判断是先进入perform还是先进入acquire
* 劳动步骤在完成prepare阶段后，通过布尔变量working在perform和acquire阶段中循环
## 基本实现
在执行任务时step的唯一入口是 **step.work()** 函数，初始的work函数是prepare阶段
```JavaScript
Step.prototype.work = function(creep){
    if(不满足一些准备条件){
        将creep进行一些准备;
    }else{
        if(适合先perform){
            working = true;
        }else{                  //适合先acquire
            working = false;
        }
        this.work = this.work_after_prepare;  //修改函数指针，之后不再判断是否满足准备条件
        return this.work(creep);  //同一tick开始工作，不浪费tick
    }
}
```
完成prepare后work函数替换为无需考虑prepare的 **step.work_after_prepare()** 函数，节省对prepare相关条件的判断，对外界而言仍然是通过 **work** 方法名执行。
```JavaScript
Step.prototype.work_after_prepare = function(creep){
    if(working){
        this.perform(creep);    //perform阶段内部完成时会把working改成false
    }else{
        this.acquire(creep);    //acquire内部完成时会把working改为true
    }
}
```
基本Step类通过上述方式对执行一个 **Step** 定义了基本接口，而 **perform()** 和 **acquire()** 函数内部将由具体功能的Step类实现。即各种功能的工作过程肯定是需要不同代码来描述的，而基本Step类的作用是对外提供一个统一的调用接口，执行步骤的角色无需受步骤内不同逻辑的影响（不需要进行额外判断），相似的不同功能Step类也可以复用基本Step类这一在perform与acquire阶段循环执行的代码。
## 待续
除了劳动以外其他基本步骤定义