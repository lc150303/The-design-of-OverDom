<img align="middle" src="./imgs/title.png">
  
QQ群：565401831  
游戏介绍及入手请移步：[hoho大佬简书教程](https://www.jianshu.com/p/5431cb7f42d3)  
[系列目录](https://zhuanlan.zhihu.com/p/104412058)  
Version：1.0  
Author：Scorpior

# Screeps 运输模式（一）流模式
<img align="middle" src="./imgs/trans0.png" width=450>

## 引言
Screeps 中绝大多数物资运输都要依靠 creeps 完成，如何灵活地完成采矿、升级、factory、lab 
等的物资运输需求是一个极其有趣的设计难题。  

本文介绍一种有效实现**物资提供者与物资需求者解耦合**及**顺路捎带**的实现方案。  
注：物资提供者及物资需求者一般是建筑。

### 预备知识
#### 运输开支
creep 部件代价及功能表见[api文档](https://screeps-cn.github.io/api/#Creep)，可见 **WORK** 
部件的造价是 **CARRY** 的两倍，让带 WORK 部件的 creep 一直在工位上工作，由只带便宜 CARRY 
部件的 creep 进行运输，会比让带 WORK 部件的 creep 浪费 tick 去跑路更节约能量。

没有路的情况下，一个 creep 要带等量 CARRY 和 MOVE 部件才能满速移动（低速移动更浪费能量），不考虑 
[boost](https://screeps-cn.github.io/resources.html#Creep-强化) 的情况下一个 CARRY 
只能运输50单位的物资，也就意味着携带50单位的物资每 tick 消耗在 creep 身体部件上的开销就是一个 
CARRY 加一个 MOVE 的开销再除以 creep 的生命 1500tick，即 **(50+50)/1500 ≈ 0.067** 能量，考虑运输一般需要 
creep 去取再拿回来跑双程，每50单位资源运输开支就是 **路程长度×2×0.067 = 0.133×路程**。假设要取10格外的50单位
energy ，那么运输开支就是 **1.33** 能量，占运输额的 **2.67%**。

有路的情况下，creep 的 CARRY 和 MOVE 部件可以采取 **2:1** 的比例，也就是运输100单位的物资时需要
**路程长度×2×(100+50)/1500** 的能量在 creep 身上，再用10格路程举例就是要花 **2** 
点能量，占运输额的 **2%**，相对更省。但是别忘了路也需要维护开销，10格路因为这个 creep 
的行走带来的额外维修开支总共是 **0.06** 
能量（这是平原路，沼泽路和墙上路需要分别×5和×150，可以自己看[api](https://screeps-cn.github.io/api/#StructureRoad)想想怎么算~），因此总开支占运输量的 **2.06%**。
