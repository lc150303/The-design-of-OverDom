# 史诗级智慧物流系统【设计】
Epic smart logistics system   

## 需求
用**最少的 creep**、**最少的时间（tick）**和**最少的 intents cpu**完成房内的和外矿的资源运输需求。因为最少的时间和最少的 intents cpu 意味着正在工作的 creep 的工作能力被最大化利用，自然就节约了 creep，因此算法目标只需要优化这两者。

情景举例：

1. creep1 正在把 mineral 运回 storage，距离终点还差2格，其他 creep 都空闲但是在远处。现在出现了从 storage 运输能量到 powerSpawn 的需求，此需求**应该分配给 creep1 等它放下 mineral 后执行**。
2. 从 lab 回收化合物，最后剩3个 lab 各有500、600、700点化合物，lab 相互之间的路程远小于 lab 到 storage 的路程。运输工的容量是1000，**应该用2趟运回化合物**，比如一趟 500+500，一趟 100+700。
3. source 处的 link 把能量传回 storage 旁的 link，此时有填充 extension 的需求，不应该把 link 中的能量放进 storage 再从 storage 中取能量填 extension，**应该拿着 link 中的能量直接去填 extension**。

## 基础工具
### timer   
### 需求登记
### 移动优化   

## 核心算法

## 完整步骤

## 策略接口