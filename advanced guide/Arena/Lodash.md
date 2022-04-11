<img align="middle" src="../imgs/arena_title.png">
  
Screeps 主QQ群：565401831  
Arena 小群：257062491  
游戏介绍及入手请移步：[hoho大佬简书教程](https://www.jianshu.com/p/5431cb7f42d3)  
[系列目录](https://zhuanlan.zhihu.com/p/104412058)  
Version：1.0  
Author：Scorpior   

# 在 Arena 中使用 lodash 及语法补全
目前（alpha 测试版）Arena 没有官方内置 **[lodash](https://www.lodashjs.com/)** 模块，习惯了 Screeps:World 的或者希望代码更简洁的小伙伴可以按如下流程把 lodash 加入自己的代码中。

Lodash 提供的大多函数都很符合**函数式编程**风格，按函数式编程来设计代码可以让逻辑更严谨。

## 一. 获取 lodash
### 方法1 
找个空闲文件夹运行
```bash
npm i lodash
```
然后你会得到一个 `node_modules` 文件夹，你需要的是里面的 `node_modules/lodash/lodash.js` 或者 `node_modules/lodash/lodash.min.js`，这两个文件功能相同，都提供了完整的 lodash 库函数，其中 `lodash.min.js` 是压缩后的版本，推荐用这个。把一个 lodash 文件拷贝到你用于 Arena 的代码文件夹里即可。
### 方法2
我上传了 **[lodash.min.js](../../src/lodash.js)**，你也可以在 Arena 代码文件夹里新建个空白 `.js` 文件把代码拷贝进去即可。

## 二. 导入 lodash
### 1. 把 lodash 改写为一个模块
`lodash.js` 和 `lodash.min.js` 的代码不能在 Arena 服务器上被正常 `import`，因为它们没有定义 `export`，所以我们要在文件最开头或者最后补一句
```bash
export default 0;
```
才能正常 `import` 它们并使用其中的函数。  
**如果你 copy 了我上传的代码，则无需再改动。**
### 2. import lodash
在你的 `main.mjs` 文件头部加一句
```javascript
import {} from 'lodash文件的相对路径'
// 例如文件在 utils/lodash.js 则相对路径为 './utils/lodash'
```
这样就可以在任意文件中通过 `_.函数名` 来使用 lodash 里面的函数。原理是 lodash 文件被 import 时已经把自身挂载在 `global` 对象上，命名为 `_` （单个下划线），可以被视为全局变量在任意文件直接调用。
## 三. lodash 语法自动补全
### 1. 准备工作
以防有小伙伴还不知道基本的 types 安装，这里补充一下，在编写 Arena 代码的文件夹里建立一个 `package.json` 文件并写入如下内容
```json
{
  "name": "arena",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Scorpior",
  "license": "ISC",
  "dependencies": {
    "@types/lodash": "^4.14.170",
    "@types/node": "^13.9.1",
    "@types/screeps-arena": "screepers/typed-screeps-arena#develop"
  }
}
```
然后在这个文件夹运行
```bash
npm i
```
即可自动安装 lodash、node 和 screeps-arena 类型文件。

### 2. 类型定义
现在我们要做的是为 `_` 写类型声明，使得在输入 `_.` 后能获得函数名提示，且不会报错说“`_` 未定义”。关于为 `.js` 文件开启类型检查可以看我的[另一篇文章](../JS类型补全.md)。

我们项目里都会有个自定义的类型文件，一般叫 `index.d.ts`，只要后缀名是 `.d.ts` 即可。安装后的 lodash 类型不会直接暴露在全局空间，所以需要在 `index.d.ts` 里 `import`
```typescript
// index.d.ts
import _ from "lodash";
```
但是这句代码会导致 VSCode 不把这个文件看作类型文件，里面定义的类型不会直接暴露到全局命名空间中，所以我们要把类型定义改写在 `declare global` 的花括号里，如
```typescript
// index.d.ts
import _ from "lodash";

declare global {
    const _: typeof _;     // 声明一个全局变量 _ 是 lodash 库
}
```
然后我们在任意 `.js` 文件就可以获得对 lodash 函数的自动补全。

## 四. 番外
按上面那样安装完 screeps-arena 类型包后，我的 VSCode 还是无法识别里面的类型文件，因为在 `node_modules\@types\screeps-arena` 目录下没有 `index.d.ts` 而是放在它子目录 `dist` 里了。我通过把 `node_modules\@types\screeps-arena\dist` 文件夹下的所有东西拷贝到上一级目录解决。

此外，我还修正了一些编写错误，并按我的习惯整理了类型定义文件的编写格式。我觉得应该是对效率和整洁度有益的。可供[下载使用](../../src/@types)。