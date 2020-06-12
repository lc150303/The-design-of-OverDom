# 房间抽象
境内领土控制对象，负责运营一个已 claim 房间，响应其他房间或上层管理者的请求

## Interface
```ts 
interface IHive {
    // 获取目前在干啥
    getStats(): {
        processPower: amount,
        upgrade: amount,
        runReaction: {type, amount},
        reverseReaction: {type, amount},
        produce: {type, amount}
    };
    // 升级
    processPower(callback): void;
    upgrade(callback): void;
    // lab
    runReaction(type, callback): void;
    reverseReaction(type, callback): void;
    // factory
    produce(type, callback): void;
    // 
    
}
```