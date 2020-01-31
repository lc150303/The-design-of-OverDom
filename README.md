OverDom Empire
=

适用于游戏《[screeps](https://screeps.com/)》的半自动 ai。

注意：  
Notes:  

本项目尚未完成，后续可能会进行大范围的代码更改。  
This project is under developing. Largely re-writing is very possible.  

本项目仅分享全局设计方案以及部分代码模块，无法直接运行。  
The purpose of this project is sharing my design pattern (in Chinese) and partial of the code, which cannot run.

简介 Introduction
-
本项目是高度面向对象编程（OOP）并且事件-任务双驱动（Task&Event-Driven）的，除了挂载在 global 对象上的全局通用函数和常量外，一切功能都由对象完成。对基本游戏对象（creep、link、lab、factory等）的调用完全通过任务或事件逻辑实现。  
**OverDom** 帝国采取层次化管理，最高领导者即 **OverDom** ， 下有各级 Officer， 下级对象保存在上级对象的成员变量中，通过 instruction（函数参数） 和 report（函数返回值）进行上下级通信。   

**OverDom** is a fully Object-Oriented programed and Task-Driven AI of [screeps](https://screeps.com/).   


交互 Interactivation
-
~~coming sooooooooooooon~~

设计 Design Pattern
-
详见[doc](doc/README.md)文件夹

代码 Scripts Sample
-
详见[src](src/README.md)文件夹

教程 Guide
-
[目录](https://zhuanlan.zhihu.com/p/104412058) (知乎)