# 全局 Spawn 共享 【设计】
自动跨房间分配 spawn 任务。  
能很好地把**援建**和**协防**统一起来。

## 思路
* 每个 creep 的出生作为一个 spawn 任务
    * 包含 creep 类型、creep 名、工作位置
    * 通过 creep 的类型进入身体装配（autosize）函数
* creep 类型划分
    1. 运输工
        * 影响 spawn 和 extension 填充，即影响 room.energyAvailable
    2. 组合队伍
        * 需要同步工作的 creep，主要有战斗小队和 puller
        * 几个 creep 出生有逻辑关联，严格来说要考虑成功出生的 creep 的位置来安排队伍中其他 creep 的出生
        * 简化设计为以集合点为中心按距离为权重找 spawn 
    3. 其他
        * 有一个固定的工作位置，严格来说应该是按工作位置考虑路程代价寻找最近的 spawn
* 妨碍出生的条件，每条的策略被下方其余条目继承
    1. 所有 spawn 都正在生
        1. 跨房生走来更快则跨房，可能要避免抢占隔壁的优先级
        1. Brood 控制的 creep 和 Squad 按距离选其他房间
    1. room.energyAvailable 不足但库存能量够
        1. 卫兵跨房生
        1. 运输工看房中无活着的运输工或者 room.energyAvailable 持续超过 50tick 就跨房生
    1. room.energyAvailable 不足且库存能量不够
        1. 运输工和矿工跨房生
        1. 其他工种在短距离内跨房生
    1. spawn 或 extension 数量不够
        1. 每种 creep 有下限体型，在 600tick 路程内找满足下限的最近房间 findClosestByRange(filter(room.energyCapacityAvailable))
        1. 找不到则缩减体型生
* 每个需要 creep 的房间（Hive、Brood、集结点）建立一个邻接表，把有 spawn 的己方房间按路程排序，过滤掉路程超过 1000 tick 的房间（过滤标准待定）

## 设计

* 用三个队列存储 spawn 任务，代表3个优先级
    * 最高优先级有**运输工**、**卫兵**
    * 第二优先级有**矿机**、**维修工**、**powerBank小队**、**进攻小队**
    * 最低优先级有**upgrader**、**外矿或deposit矿工**、**claimer**、**builder**
    ```js 
    // in spawn manager
    let spawnQueues = [{}, {}, {}];
    function addSpawnTask(zerg, time){
        let queue = spawnQueues[zerg.priority];
        if(!queue[time]){
            queue[time] = [];
        }
        queue[time].push(zerg);
    }

    // in Hive
    function setSpawnTask(type, workPosition, time){
        let zerg = 根据type和workPosition获取zerg实例(type, workPosition);
        spawnManager.addSpawnTask(zerg, time);
    }
    
    // in creep 
    let time = Game.time + interval;
    Hive.setSpawnTask(type, workPosition, time);
    ```
* 出生时检查更高优先级，如果自己的出生会遮挡更高优先级的 creep 则将其提前生，自己等待
    ```js 
    // in spawn manager
    let spawnQueues = [{}, {}, {}];
    function checkSpawnQueues(){
        for(let priority in spawnQueues){
            let queue = spawnQueues[priority];
            if(queue[Game.time]){
                for(let task of queue[Game.time]){  // map 最高和非最高优先级
                    if(可以在这个room生(task)){     // 此处考虑妨碍出生的情况和 creep 类型
                        for(let higherPriority = 0; higherPriority<priority; higherPriority++){
                            for(let time = Game.time+1; time<Game.time+生该creep总用时; time++){
                                if(spawnQueues[higherPriority][time]){
                                    for(let otherTask of spawnQueues[higherPriority][time]){
                                        if(需要在这个room生(otherTask)){    // 房间在这段时间内不会空出任一 spawn
                                            改作生(otherTask);  // 重新分配 task
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ```