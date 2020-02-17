# 全局 Spawn 共享 【设计】
跨房间的 spawn 任务分配。  
能很好地把**援建**和**协防**统一起来。

## 思路
* 每个 creep 的出生作为一个 spawn 任务
    * 包含 creep 类型、creep 名、工作位置
    * 通过 creep 的类型进入身体装配函数
* 决定跨房间出生的条件
    * 是紧急类 creep
        * 运输工
        * 卫兵
        * powerBank小队
    * room.energyCapacityAvailable 小于需求 或 ( 房间总能量小于需求 且 room.energyAvailable 小于需求)
* 建立一个属于自己的房间的邻接表，按路程排序，本房间作为第一个，过滤掉路程超过 1000 tick 的房间

## 设计

* 用三个队列存储 spawn 任务，代表3个优先级
    * 最高优先级有**运输工**、**卫兵**
    * 第二优先级有**矿机**、**维修工**、**powerBank小队**、**进攻小队**
    * 最低优先级有**upgrader**、**外矿或deposit矿工**、**claimer**、**builder**
    ```js 
    // in spawn manager
    var spawn_queue = {};
    
    // in creep 
    let task_time = Game.time + interval;
    if(!spawn_queue[task_time]){
        spawn_queue[task_time] = [];
    }
    spawn_queue[task_time].push = {
        type: type,
        name: name,
        working_pos: RoomPosition
    }
    ```