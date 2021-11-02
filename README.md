OverDom Empire
=

适用于游戏《[screeps](https://screeps.com/)》的半自动 ai。

注意：  
Notes:  

本项目尚未完成，后续可能会进行大范围的代码更改。  
This project is under developing. Large rework is in progress.  

本项目仅分享全局设计方案以及部分代码模块，无法直接运行。  
The purpose of this project is sharing my design pattern (in Chinese) and partial codes, which cannot run.

简介 Introduction
-
本项目是高度面向对象编程（OOP）并且任务驱动（Task-Driven）的，除了挂载在 global 对象上的全局通用函数和常量外，一切功能都由对象完成。对基本游戏对象（creep、link、lab、factory等）全都分别封装在管理对象中，任务或事件逻辑调用。  
**OverDom** 帝国采取层次化管理，最高领导者即 **OverDom** ， 下有各级 Officer， 下级对象保存在上级对象的成员变量中。游戏逻辑分为三层：战略逻辑、战术逻辑、基本动作，每层由不同管理者执行，上层功能拆分成下层子任务来完成。   

**OverDom** is a fully Object-Oriented programed and Task-Driven AI of [screeps](https://screeps.com/).   


教程 Guide
-
[目录](https://zhuanlan.zhihu.com/p/104412058) (知乎)


交互 Interactivation
-

设计 Design Pattern
-

代码 Scripts Sample
-