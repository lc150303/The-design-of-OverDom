"use strict"

/**
 *  efficient link control
 *  高效link管理
 *  Author: lc150303@Github, Scorpior_gh@Screeps,
 *  Version: 1.1
 * 
 *  核心设计：
 *  1.通过阈值判断是否应该收发能量；
 *  2.通过不同类型link的有序排列实现一轮管理时对每个link角色（以角色计）只需访问一次；
 *  3.通过发布任务控制creep是否应该填充or清空link
 *   
 *  注：仍然存在优化空间
 */

/**
 *  require 任务相关类
 */
let Task = require('Task');
let Step = require('Task~Step~Transport');

/**
 *  阈值常量
 *  将link分为3类：
 *  1.采集link（包括接收外矿的），代表了主要功能是creep放入能量的link，不需要被传入能量，need = 0；
 *  2.升级link，在房间控制器旁边，也可代表主要功能是creep取用能量的link，能量过少时需要被传入能量；
 *  3.仓库link，在仓库旁边，即能收也能发，还需要指挥creep搬运。
 * 
 *  一个link可以身兼多个角色，升级link的阈值可以兼顾harvest任务，即能量过多（采集的比消耗的多，有盈余）时往外发
 *  除了仓库link以外，往外发的阈值设置的比较大，一次发送大批量，减少发送次数，节约cpu
 *  升级link的阈值可以兼顾其他取用能量的link角色
 */
const LINK_ROLE_THRESHOLD = {
    'harvest': {need:0, ready:755},
    'storage': {need:800, ready:100},    // ready小于need实现既判定为能收也判定为能发
    'upgrade': {need:100, ready:755}
}

/**
 *  基本link类，用函数原型链实现class（面向对象）
 *  成员变量包含两个抽象变量：
 *  1.link，指的是通过 Game.getObjectById() 获取的 StructureLink 对象
 *  2.energy， 记录 StructureLink 对象的能量结余
 * 
 *  @param {object} args {role:string, name:room_name, id}
 */
function Base_Link(args){
    this.threshold = LINK_ROLE_THRESHOLD[args.role];
    this.id = args.id;
    this.name = args.name;
    this.link;
    this.energy;
    //console.log('link '+this.id+' threshold '+this.threshold);
}

Base_Link.prototype.update = function(){
    /**
     *  更新为当前tick的数据
     */
    this.link = Game.getObjectById(this.id);
    this.energy = this.link.store[RESOURCE_ENERGY];
    return this;
}

Base_Link.prototype.is_ready = function(){
    /**
     *  冷却已好且能量大于 ready 时可以外送
     */
    return this.link.cooldown == 0 && this.link.energy >= this.threshold.ready;
}

Base_Link.prototype.need_energy = function(){
    /**
     *  能量小于 need 时需要接收，设置20的容忍空间避免小批量发送的cpu浪费
     */
    return this.energy+20 < this.threshold.need;
}

Base_Link.prototype.transfer_energy = function(target){
    /**
     *  控制发送的能量数量，避免超过接受者的外发阈值，接受者是仓库link时除外；避免发送后自己的能量小于接收阈值，否则会引起其他link重复发能量过来
     *  三元表达式冒号前是仓库link，冒号后是普通 link
     *  发送成功后游戏数据会在下tick才变化，自己提前通过target.energy维护变化量提高管理效率
     */
    let amount = Math.min((target.threshold.ready<target.threshold.need ? 800 : target.threshold.ready)-target.energy,  // 对于非仓库link，发送量不超过其外发阈值减其当前能量
        (this.energy<=this.threshold.need ? this.energy : this.energy-this.threshold.need));                            // 对于非仓库link，发送量不超过本身能量减接收阈值  
    console.log(colourful(this.name+' tar.thr '+target.threshold.ready+' tar.en '+target.energy+' this.thr '+this.threshold.need+' this.en '+this.energy+' transfer '+amount, '金菊黄'));
    this.link.transferEnergy(target.link, amount);
    target.energy += amount;
}

/**
 * 仓库link类，继承基础link，增加发布搬运任务的功能
 * 成员变量rank含义为仓库link在link队列中的位置（序号），后方（序号更大的）是升级link，仓库link只往升级link发能量
 * @param {object} args {role:string, id, rank, room_name}
 */
function Storage_Link(args){
    /**
     *  inherit from Base_Link
     */
    global.super(this, [Base_Link], args);
    this.rank = args.rank;
    this.task_pubed = false;
}

inherit(Storage_Link, [Base_Link]);

/**
 *  发布搬运任务
 *  当序号比自己更大的link能量未被满足时，发布用storage能量补充仓库link的任务；
 *  当序号比自己大的link都被满足了，而自己能量很多时，把能量运回storage储存。
 *  @param {number} link_need_energy 能量未被满足的link序号
 */
Storage_Link.prototype.publish_task = function(link_need_energy){
    //console.log('link '+this.task_pubed+' j '+link_need_energy);
    let storage = this.link.room.storage;
    if(!this.task_pubed && link_need_energy > this.rank  && storage && storage.store[energy]>800){
        /**
         *  need to withdraw energy from storage
         */
        let step_args = {
            name: 'fill storage-link of '+this.name,
            sources: [storage.id],
            destinations: [this.id],
            types: [RESOURCE_ENERGY],
            amount: this.threshold.need-100-this.energy
        }
        let fill_step = new Step(step_args);
        fill_step.set_prepare(0);
        let fill_task = new Task({steps:[fill_step], name:'fill storage-link of '+this.name});
        fill_task.is_expired = ()=>Game.getObjectById(this.id).store[energy]>700;
        fill_task.notify = ()=>{console.log(colourful(this.name+' link is notified', '金菊黄')); this.task_pubed = false};
        this.task_pubed = true;
        console.log(colourful('task pubed '+fill_task.name, '金菊黄'));
        return fill_task;
    }else if(!this.task_pubed && this.threshold.need- this.energy <= 100 && storage && storage.store.getFreeCapacity(energy)>800){
        /**
         *  need to store energy to storage
         */
        let step_args = {
            name: 'clear storage-link of '+this.name,
            sources: [this.id],
            destinations: [storage.id],
            types: [RESOURCE_ENERGY],
            amount: 700
        }
        let clear_step = new Step(step_args);
        clear_step.set_prepare(0);
        let clear_task = new Task({steps:[clear_step], name:'clear storage-link of '+this.name});
        clear_task.is_expired = ()=>Game.getObjectById(this.id).store[energy]<400;
        clear_task.notify = ()=>{console.log(colourful(this.name+' link is notified', '金菊黄')); this.task_pubed = false};
        this.task_pubed = true;
        console.log(colourful('task pubed '+clear_task.name, '金菊黄'));
        return clear_task;
    }
}

/**
 *  link管理入口对象，为所有link分配角色并排序
 *  可能影响link角色的邻近建筑（或资源点）有：storage、controller、source
 *  如果要添加新的link角色，需要给新的关联建筑
 * 
 *  @param {object} args {links:[link], possible_objects:[storage,controller,source]}
 */
function Link_Manager(args){
    var harvest_links = [];
    var upgrade_link = [];
    var storage_link_arg;
    
    for(let link of args.links){
        let is_harvest_link = false;
        let is_storage_link = false;
        let is_upgrade_link = false;

        let adjacent_objects = link.pos.findInRange(args.possible_objects, 4);  // 寻找4格内可能影响link角色的建筑
        for(let object of adjacent_objects){
            if(object.energy){
                /**
                 *  找到资源点，是采集link
                 */
                is_harvest_link = true;
            }else if(object.structureType == STRUCTURE_STORAGE){
                /**
                 *  找到storage，是仓库link
                 *  仓库link的阈值不受其他link角色影响，break
                 */
                is_storage_link = true;
                break;
            }else{
                /**
                 *  目前仅剩的建筑是controller，是升级link
                 */
                is_upgrade_link = true;
            }
        }

        let link_args = {'id':link.id, 'name':link.room.name};
        if(is_storage_link){
            /**
             *  仓库link需要知道自己在队列中的位置，所以等其他link先排好队再初始化仓库link
             *  storage link will be create after other links
             */
            link_args.role = 'storage';
            storage_link_arg = link_args;
        }else if(is_harvest_link){
            if(is_upgrade_link){
                /**
                 *  兼职升级link，使用升级link的阈值
                 */
                link_args.role = 'upgrade';
                let the_link = new Base_Link(link_args);
                /**
                 *  在采集link中的尾端，即虽然可以外发能量，但不优先从它发出
                 *  放入升级link队列的前端，即接收能量优先级不高。如果要添加填塔link等更优先接受能量的link角色，则将新角色放在队列尾端。
                 */
                harvest_links.push(the_link);
                upgrade_link.unshift(the_link);
            }else{
                /**
                 *  单纯采集link，优先外发能量
                 */
                link_args.role = 'harvest';
                harvest_links.unshift(new Base_Link(link_args));
            }
        }else if(is_upgrade_link){
            /**
             *  单纯升级link，不需要放在能外发能量的队列
             */
            link_args.role = 'upgrade';
            upgrade_link.push(new Base_Link(link_args));
        }else{
            /**
             *   外矿link在目前设计中都是单纯采集link
             */
            link_args.role = 'harvest';
            harvest_links.unshift(new Base_Link(link_args));
        }
    }
    
    /**
     *  组装最终队列 [采集link, ..., 采集link, 仓库link, 升级link, ..., 升级link]
     *  队列中位置越靠前（靠左）则越优先外发能量，位置越靠后则越优先接收能量
     *  create storage link and assemble all links into one array
     */
    if(storage_link_arg){
        /**
         *  如果有仓库link，则接在采集link末尾
         *  there is a storage link
         */
        storage_link_arg.rank = harvest_links.length;
        harvest_links.push(new Storage_Link(storage_link_arg));
        this.storage_rank = storage_link_arg.rank;
    }
    this.links = harvest_links.concat(upgrade_link);
    console.log(colourful('storage link 位置:'+this.storage_rank+'  全id：'+this.links.map((link)=>link.id), '金菊黄'));
}

/**
 *  实际管理link
 *  用i从前往后遍历，代表准备发能量的link
 *  用j从后往前遍历，代表可能需要能量的link
 *  i不小于j时结束，不反向发送
 */
Link_Manager.prototype.manage_links = function(){
    let i = 0;
    let j = this.links.length-1;

    /**
     *  更新所有link的数据
     *  get the StructureLink of this tick
     */
    this.links.map((link) => link.update());

    /**
     *  仓库link作为中点，前方（序号小）的扮演外发的link角色，后方是接收的link角色
     *  身兼多角色的link在仓库link前后各占一位
     *  一般一个房间不超过1个link兼多角色
     *  balance energy
     *  j never go smaller than storage link
     */
    while(i<j && j>=this.storage_rank){
        let linkj = this.links[j];
        if(linkj.need_energy()){
            let linki = this.links[i];
            if(linki.is_ready()){
                linki.transfer_energy(linkj);
                if(!linkj.need_energy()){
                    /**
                     *  能量需求被这次传输满足了
                     */
                    j -= 1;
                }
            }
            /**
             *  如果未ready，略过这个i
             *  如果ready则发送了，会进入冷却，略过这个i
             */
            i += 1;
        }else{
            /**
             *   如果不需要能量，略过这个j
             */
            j -= 1;
        }
    }

    /**
     *  若有仓库link则让它看看要不要发任务，没有着返回空
     *  storage link publish task
     */
    return this.storage_rank != undefined ? this.links[this.storage_rank].publish_task(j) : undefined;
}

module.exports = Link_Manager;