# Larva 基因组
巢穴（Hive）和族群（Brood）控制 creep 时并不直接操作官方的 Creep 
对象，而是通过缓存的**控制对象**进行操作，控制对象与 creep 一一对应，控制对象中存储 creep 的名字、任务等信息。

Larva 基因组是 creep 的控制对象的基类。
## 工作流程
#### 创建
1. OverSeer 初始化时遍历所有活着的 creep， 整理成属于 OverLord 的和 WarLord，作为二者的初始化参数。
2. OverLord 把各房 creep 作为各 Hive 或者 Brood 的初始化参数。
3. Hive 或 Brood 根据建筑和矿点进行初始化，对应的管理对象发布第一批任务。
4. Hive 或 Brood 为活着的 creep 建立管理对象并全部置于激活态，遍历任务列表为一个执行者也没有的任务类型建立对应类型的管理对象。
#### 二态性
##### 的的的
###### 的的
的