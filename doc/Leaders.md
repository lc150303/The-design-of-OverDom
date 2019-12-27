# 领导架构

## 最高领袖 OverDom
main.js中引用全局唯一 **OverDom**，所有功能的唯一最高入口。  
管理全局配置和全局目标。  
直接下属为 **Listener** 和 **OverSeer**。
## 帝国级官员
### Listener
负责和owner(账号所有者)交互。  
维护挂载在 global 上的交互函数，用于从控制台调用。  
监听特殊 flag 和 memory 特定位置。
### OverSeer
实际功能的最高组织者。  
其名下保存所有基本基因组。  
负责战争事务和经济事务间对接。  
直接下属为 **WarLord** 和 **OverLord** ，分别管理战争事务和经济事务。  
## 经济事务官员
### OverLord
统筹一个Shard中的所有经济事务。  
管理所有战略物资（化合物、ops）。  
管理产业链。  
管理市场交易。  
直接下属为 **Governor**。
#### Governor
统筹一个Sector中的所有经济事务。  
其名下保存外矿、开新房、援建、deposit采集的creep类及配置。  
管理外矿、开新房、援建、deposit采集。  
分配室外creep的spawn任务，分配Spawn满载的房间溢出的spawn任务。  
直接下属为 **Queen**。  
##### Queen
运营一个房间。  
其名下保存室内creep和室内建筑的封装类及配置。  
接受室外creep的spawn任务，执行高级建筑所需的物流任务。
## 战争事务官员
### WarLord
统筹全局侦查和战争。  
分配战争任务。  
发射nuke。  
直接下属为 **Intelligence** 和 **Captain**。  
#### Intelligence
负责视野获取、与游戏世界内其他玩家交互。  
其名下保存所有侦查任务类。  
管理所有observer。  
管理白名单和黑名单系统。  
直接下属为 **Scout**。
##### Scout
眼。  
其名下保存侦查任务的creep类和配置。  
提交creep出生请求。
#### Captain
具体战斗的指挥者。  
其名下保存所有战斗和劫掠任务类和Squad类和配置。   
管理下属Squad的数量和类型。    
管理下属Squad的任务队列。   
直接下属为 **Squad** 。 
##### Squad 
creep小队。  
其名下保存战斗和劫掠所需的creep类及配置。  
提交creep出生和boost需求。  
## 问题
* 室外运输任务既在经济运维中用到，也在劫掠中用到，对应的任务类和creep类放在哪可以简化
* 室外日常运维的视野需求是否要传递到Intelligence