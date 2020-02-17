设计文档
=
标注说明：  
* 【设计】：其中内容完全未上线
* 【实装】：其中内容已经完全上线
* 【优化】：其中部分内容已经在旧版设计中上线，新增了一些未上线的改动
* 【未来】：暂未开始设计

框架设计
-
【架构实装|功能设计】[帝国](Leaders.md)：代码框架及功能划分

任务系统
-
【实装】[基本Task类](Task.md)v1.0：任务的通用框架，定义回调接口与步骤组合接口。  
【优化】[基本Step类](Step.md)v1.1：定义步骤基本阶段与基本循环  
【实装】物流Step类（coming sooon）  
【设计】基建Step类（coming soooon）  
【设计】travel Step类（coming sooooon）  
【设计】claim/reserve Step类（coming soooooon）  
【未来】pull Step类  
【未来】boost Step类    
【未来】侦查Step类  
【未来】战斗Step类  
【未来】powercreep Step类  
【未来】Squad Step类  

creep/power creep系统
-
【设计】幼虫Larva基因（creep基本封装对象）  
【设计】工蜂Drone基因（角色型creep封装）  
【设计】飞蛇Viper基因（任务型creep封装）  
【设计】蟑螂Roach基因（renew型creep封装）  
【设计】菌毯CreepTumor基因（工作中顺路repair封装）  
【未来】xxx基因（powercreep基本封装对象）  
【未来】xxx基因（运维operator封装）  
【未来】xxx基因（战斗operator封装）  
【未来】xxx基因（运维executor封装）  
【未来】xxx基因（战斗executor封装）  
【未来】xxx基因（commander封装）  

中队系统
-
【设计】基本Squad类  
【设计】运输小队  
【未来】2人小队  
【未来】3人power队  
【未来】4人小队  
【未来】6人小队  
【未来】9人小队  

室内运维
-
【实装】各级rcl采集管理（coming soon）  
【实装】link管理（coming soon）  
【设计】[spawn队列管理](./Spawn.md)v0.1：全局 spawn 统一管理  
【设计】升级速度动态管理  
【设计】tower管理（coming soooon）  
【设计】室内任务队列（coming soooon）  
【未来】静态防御建设  
【未来】lab管理  
【未来】factory管理  

室外运维
-
【设计】外矿建设  
【设计】外矿物流  
【设计】援建  
【未来】deposit采集    
【未来】中心矿采集  
【未来】战略资源管理  
【未来】产业链管理

战斗
-
【未来】power采集  
【未来】stronghold清理  
【未来】单房防御  
【未来】支援防御  
【未来】拦截  
【未来】攻城  

交互
-
【未来】owner交互  
【未来】互助系统