"use strict"

/**
 *  TODO:
 *  0.默认withdraw == OK，如果有其他可能要改
 *  1.需要 global[room.name].mass_stores 配合
 *  2.pick step
 *  3.等
 */

/**
 *  重点取任务和重点放任务————prepare实现
 *  限制数量任务：nuker, ps, lab(boost)，不同类型各发一个任务
 * 
 *  通用函数：单/多src取，单/多dst放, 等取, 等放, pick取
 *  单-单：清container，填tower，填link，清link，清terminal→storage，
 *  单-多：清fac，
 *  多-单：填container，填fac，填terminal, 填lab，填ps，填nuker
 *  多-多：填ext，清lab，
 *  等取：pb
 *  等放：刷墙、外矿link
 *  pick：pb，dirty
 *  
 */

function one_src_acquire(creep, moveOnly){
    let src = Game.getObjectById(this.srcs);
    let type = get_resource_type(src.store, this.types, true);
    if(src && type){
        // 有效src
        if(creep.pos.isNearTo(src)){
            if(moveOnly) return OK; 

            creep.withdraw(src, type);   // 默认OK
            if(src.store[type] < creep.store.getFreeCapacity()){
                //  建筑中的该种资源已拿完
                this.types.delete(type);
                if(get_resource_type(src.store, this.types, true)){
                    // 还有其他种类资源也在任务清单中
                    return OK;
                }
                // else 没有更多的，开始运到dst
            }
            // else 装满了，开始运到dst
        }else{
            return creep.moveTo(src);
        }
    }else{
        // 无src
        let type = get_resource_type(creep.store, this.types);
        if(!type || moveOnly){
            //  身上无资源，弹出过期任务
            this.expired = true;
            return ERR_NOT_ENOUGH_RESOURCES;
        }
        // else 拿了一些，开始运到dst
    }
    // 所有开始运到dst的分支
    this.working = true;
    return this.perform(creep, true);
}

function multi_src_acquire(creep, moveOnly){
    let src = Game.getObjectById(this.src_of_this_shipment);
    let type = get_resource_type(src?src.store:undefined, this.types, true);
    if(!type){
        this.srcs.delete(this.src_of_this_shipment);
        for(let id of this.srcs){
            src = Game.getObjectById(id);
            if(src){
                type = get_resource_type(src.store, this.types, true);
                if(type){
                    this.src_of_this_shipment = id;
                    break;
                }
            }
            this.srcs.delete(id);
        }
    }

    if(type){
        // 有效src
        if(creep.pos.isNearTo(src)){
            if(moveOnly) return OK; 

            creep.withdraw(src, type);   // 默认OK
            if(src.store[type] < creep.store.getFreeCapacity()){
                //  建筑中的该种资源已拿完, creep没满
                let type = get_resource_type(src.store, this.types, true);
                if(type){
                    // 该建筑还有清单资源
                    return OK;
                }else{
                    // 查找可行src
                    this.srcs.delete(src.id);
                    type = undefined;
                    for(let id of this.srcs){
                        src = Game.getObjectById(id);
                        if(src){
                            type = get_resource_type(src.store, this.types, true);
                            if(type){
                                this.src_of_this_shipment = id;
                                break;
                            }
                        }
                        this.srcs.delete(id);
                    }
                    if(type){
                        // 有下一个src，去src
                        if(!creep.pos.isNearTo(src)){
                            return creep.moveTo(src);
                        }
                        // 下一个src也在身边
                        return OK;
                    }
                    // else 没src但是拿了东西，开始运到dst
                }
            }
            // else 装满了，开始运到dst
        }else{
            return creep.moveTo(src);
        }
    }else{
        // 无src
        let type = get_resource_type(creep.store, this.types);
        if(!type || moveOnly){
            //  身上无资源，弹出过期任务
            this.expired = true;
            return ERR_NOT_ENOUGH_RESOURCES;
        }
        // else 拿了一些，开始运到dst
    }
    // 所有开始运到dst的分支
    this.working = true;
    return this.perform(creep, true);
}

function one_dst_perform(creep, moveOnly){
    let type = get_resource_type(creep.store, this.types);
    if(!type){
        // 身上空，保底防bug
        this.working = false;
        return this.acquire(creep);
    }

    let dst = Game.getObjectById(this.dsts);
    let free_space = getFreeCapacity(dst?dst.store:undefined, type);
    if(dst && free_space){
        // valid dst
        if(creep.pos.isNearTo(dst)){
            if(moveOnly) return OK;

            creep.transfer(dst, type);
            let carry_amount = creep.store[type];
            if(carry_amount < free_space){
                // 建筑继续可放，可能是creep身上带了多种type
                this.finished_amount += carry_amount;
                if(this.finished_amount < this.intended_amount){
                    if(creep.store.getCapacity() > carry_amount){
                        /**
                         * 如果身上还有其他type会在下一tick继续perform
                         * 如果其他type不是任务目标会在上面if(!type)回到acquire
                         */
                        return OK;
                    }else{
                        // 没完成amount，去找src
                        this.working = false;
                        return this.acquire(creep, true);
                    }
                }
                // else 完成了足够的amount，step完成
            }
            // else 建筑放满了，step完成

            // step 完成
            this.finished = true;
            return OK;
        }else{
            return creep.moveTo(dst);
        }
    }else{
        // no dst
        this.expired = true;
        return ERR_INVALID_TARGET;
    }
}

function multi_dst_perform(creep, moveOnly){
    let type = get_resource_type(creep.store, this.types);
    if(!type){
        // 身上空，保底防bug
        this.working = false;
        return this.acquire(creep);
    }

    let dst = Game.getObjectById(this.dst_of_this_shipment);
    let free_space = getFreeCapacity(dst?dst.store:undefined, type);
    if(!free_space){
        this.dsts.delete(this.dst_of_this_shipment);
        for(let id of this.dsts){
            dst = Game.getObjectById(id);
            if(dst){
                free_space = getFreeCapacity(dst.store, type);
                if(free_space){
                    this.dst_of_this_shipment = id;
                    break;
                }
            }
            this.dsts.delete(id);
        }
    }

    if(free_space){
        // valid dst
        if(creep.pos.isNearTo(dst)){
            if(moveOnly) return OK;

            creep.transfer(dst, type);
            let carry_amount = creep.store[type];
            if(carry_amount <= free_space){
                // 建筑继续可放，可能是creep身上带了多种type
                this.finished_amount += carry_amount;
                if(this.finished_amount < this.intended_amount){
                    if(creep.store.getCapacity() > carry_amount){
                        /**
                         * 如果身上还有其他type会在下一tick继续perform
                         * 如果其他type不是任务目标会在上面if(!type)回到acquire
                         */
                        return OK;
                    }else{
                        // 没完成amount，去找src
                        this.working = false;
                        return this.acquire(creep, true);
                    }
                }
                // else 完成了足够的amount，step完成
            }else{
                this.dsts.delete(dst.id);
                free_space = undefined;
                for(let id of this.dsts){
                    dst = Game.getObjectById(id);
                    if(dst){
                        free_space = getFreeCapacity(dst.store, type);
                        if(free_space){
                            this.dst_of_this_shipment = id;
                            break;
                        }
                    }
                    this.dsts.delete(id);
                }

                if(free_space){
                    // 有其他dst
                    if(!creep.pos.isNearTo(dst)){
                        return creep.moveTo(dst);
                    }
                    // 下一个dst也在身边
                    return OK
                }
                // else 没有空dst了，step完成
            }

            // step 完成
            this.finished = true;
            return OK;
        }else{
            return creep.moveTo(dst);
        }
    }else{
        // no dst
        this.expired = true;
        return ERR_INVALID_TARGET;
    }
}

/**
 *  prepare 阶段
 *  区别只是ready时先working=true还是=false
 */

function focus_acqire(creep){
    let store = creep.store;
    if(store.getUsedCapacity() && store.getFreeCapacity()<this.intended_amount){
        // 身上有东西，空闲空间不够直接完成任务
        if(!this.dirty_types){
            let carrying_types = new Set(Object.keys(store));
            for(let type of this.types){
                // 在任务清单中的不算杂物
                carrying_types.delete(type);
            }
            if(carrying_types.size){
                // 身上有杂物
                this.dirty_types = carrying_types;
            }
            // else 身上东西都在任务清单里
        }
        if(this.dirty_types){
            // 有杂物
            for(let type of this.dirty_types){
                // 处理第一种杂物，没地方放就扔
                let mass_stores = global[creep.room.name].mass_stores.filter(
                    (s)=> getFreeCapacity(s.store, type)>10
                )
                let dst = mass_stores[0];
                if(dst){
                    // 有地方放
                    if(creep.pos.isNearTo(dst)){
                        creep.transfer(dst, type);
                        // 能放完就从杂物清单中删除
                        if(creep.store[type]<=getFreeCapacity(dst, type))
                            this.dirty_types.delete(type);
                        return OK;
                    }else{
                        return creep.moveTo(dst);
                    }
                }else{
                    // 没地放就扔，从杂物清单中删除
                    this.dirty_types.delete(type);
                    return creep.drop(type);
                }
            }
            // for循环中全部return走，没进入for循环即 this.dirty_types.size==0 时准备好了
        }
        // else 没杂物，准备好了
    }else if(store.getCapacity() == 0){
        // 没carry部件，激活回调函数通知弹出任务
        return this.inform_unqualified();
    }
    // else 有部件，没杂物或者剩余空间足够，准备好了
    
    this.ready = true;
}

function focus_perform(creep){
    focus_acqire.call(this, creep);
    if(this.ready){
        let carried = creep.store.getUsedCapacity();
        // 如果身上比较多或者足够填任务（小额任务如填link、填extension）,直接去填
        if(carried>0.5*creep.store.getCapacity() || carried>this.intended_amount)
            this.working = true;
    }
}

/**
 *  运输任务
 *  单src和单dst的函数比较省cpu，能不multi就不multi
 *  multi灵活
 * @param {*} args {name, sources:id, destinations:id, types:Set(*), amount}
 */
function Step_Transport_121(args){
    /**
     *  one-to-one 运输
     *  如果 args.types == undefined 就是什么都拿
     */
    global.super(this, [Step_Labor], args);

    this.types = args.types;
    this.intended_amount = args.amount;
    this.finished_amount = 0;

    this.acquire = one_src_acquire;
    this.perform = one_dst_perform;
    this.prepare = args.focus_acqire? focus_acqire : focus_perform;
    this.dirty_types;
}
inherit(Step_Transport_121, [Step_Labor]);

function Step_Transport_12m(args){
    /**
     *  one-to-multi 运输
     *  如果 args.types == undefined 就是什么都拿
     */
    global.super(this, [Step_Labor], args);

    this.types = args.types;
    this.intended_amount = args.amount;
    this.finished_amount = 0;

    this.acquire = one_src_acquire;
    this.perform = multi_dst_perform;
    this.prepare = args.focus_acqire? focus_acqire : focus_perform;
    this.dirty_types;
}
inherit(Step_Transport_12m, [Step_Labor]);

function Step_Transport_m21(args){
    /**
     *  multi-to-one 运输
     *  如果 args.types == undefined 就是什么都拿
     */
    global.super(this, [Step_Labor], args);

    this.types = args.types;
    this.intended_amount = args.amount;
    this.finished_amount = 0;

    this.acquire = multi_src_acquire;
    this.perform = one_dst_perform;
    this.prepare = args.focus_acqire? focus_acqire : focus_perform;
    this.dirty_types;
}
inherit(Step_Transport_m21, [Step_Labor]);

function Step_Transport_m2m(args){
    /**
     *  multi-to-multi 运输
     *  如果 args.types == undefined 就是什么都拿
     */
    global.super(this, [Step_Labor], args);

    this.types = args.types;
    this.intended_amount = args.amount;
    this.finished_amount = 0;

    this.acquire = multi_src_acquire;
    this.perform = multi_dst_perform;
    this.prepare = args.focus_acqire? focus_acqire : focus_perform;
    this.dirty_types;
}
inherit(Step_Transport_m2m, [Step_Labor]);




function Step_Transport(args){
    global.super(this, [Step_Labor], args);
    /**
     *  如果 this.types == undefined 就是什么都拿
     */
    this.types = args.types;
    this.intended_amount = args.amount;
    this.finished_amount = 0;
    this.dst_of_this_shipment;
    this.src_of_this_shipment;
    this.shipment_type;
}

inherit(Step_Transport, [Step_Labor]);

Step_Transport.prototype.perform = function(creep){
    /**
     *  如果 this.types == undefined 就是什么都搬
     *  把身上的物品放到指定容器
     */
    let type = get_resource_type(creep.store, this.types);
    if(!type){ 
        /**
         *  身上没有任务货物
         */
        this.working = false;
        /**
         *  但是有杂物
         */
        if(creep.store.getUsedCapacity()>=50){
            console.log(creep.name+' not qualified for step '+this.name);
            this.inform_unqualified();
        }
        return undefined;
    }
    let my_dst = Game.getObjectById(this.dst_of_this_shipment);
    if(!my_dst || my_dst.store.getFreeCapacity(type) < 20){
        my_dst = undefined;
        let dsts = this.dsts.map((dst)=>Game.getObjectById(dst));
        for(let possible_dst of dsts){
            if(possible_dst.store && possible_dst.store.getFreeCapacity(type) > 20){
                this.dst_of_this_shipment = possible_dst.id;
                my_dst = possible_dst;
                break;
            }
        }
    }
    if(!my_dst){
        /**
         *  没有合适的dst
         */
        this.expired = true;
        return undefined;
    }
    //console.log(this.name+' perfrom dst:'+my_dst.id);
    if(creep.transfer(my_dst, type) == ERR_NOT_IN_RANGE){
        creep.moveTo(my_dst, {reusePath: 8})
    }else if(creep.store.getUsedCapacity() == creep.store[type] && my_dst.store.getFreeCapacity[type] >= creep.store[type]){
        if(this.finished_amount >= this.intended_amount){
            this.finished = true;
        }else{
            this.working = false;
        }
    }
}

Step_Transport.prototype.acquire = function(creep){
    if(creep.store.getCapacity() == 0){
        /**
         *  没有carry部件
         */
        console.log(creep.name+' not qualified for step '+this.name);
        this.inform_unqualified();
    }
    /**
     *  从指定容器中取出物品
     */
    let my_src = Game.getObjectById(this.src_of_this_shipment);
    let type = my_src? (my_src.store? get_resource_type(my_src.store, this.types) : my_src.resourceType) : undefined;
    if(!my_src || !type){
        my_src = undefined;
        let srcs = this.srcs.map((src)=>Game.getObjectById(src));
        for(let possible_src of srcs){
            if(!possible_src){
                continue;
            }
            type = possible_src.store ? get_resource_type(possible_src.store, this.types) : possible_src.resourceType;
            if(type && ((possible_src.store && possible_src.store[type]>20) || possible_src.amount > 20)){
                my_src = possible_src;
                this.src_of_this_shipment = possible_src.id;
                break;
            }
        }
    }
    if(!my_src || this.finished_amount >= this.intended_amount){
        /**
         *  没有合适的src 或者已经运够了
         */
        let work_load = creep.store.getUsedCapacity();
        if(work_load == 0){
            /**
             *  啥也没拿  
             */
            this.finished = true;
        }else{
            /**
             *  只是没拿满
             */
            this.finished_amount += work_load;
            this.working = true;
        }
        return undefined;
    }

    if(creep.withdraw(my_src, type) == ERR_NOT_IN_RANGE || creep.pickup(my_src) == ERR_NOT_IN_RANGE){
        creep.moveTo(my_src);
    }else if(creep.store.getFreeCapacity() <= (my_src.store? my_src.store[type] : my_src.amount)){
        /**
         *  默认 == OK，如果有其他可能要改这里
         */
        //console.log(colourful(`${creep.name} range ${creep.pos.getRangeTo(my_src)} ${creep.store.getFreeCapacity()} ${(my_src.store? my_src.store[type] : my_src.amount)}`, '纯红'));
        this.finished_amount += creep.store.getFreeCapacity()+creep.store[type];
        this.working = true;
    }else{
        //console.log(colourful(`${creep.name} ${creep.store.getFreeCapacity()} ${(my_src.store? my_src.store[type] : my_src.amount)}`, '纯红'));
        this.src_of_this_shipment = undefined;
    }
}

let prepare_level = {
    0: prepare_0
}

Step_Transport.prototype.set_prepare = function(level){
    /**
     *  按照 level 等级选择不同的 prepare 函数
     *  0 级就是不用准备
     *  高级就是获取对应的 boost
     */
    let f = prepare_level[level];
    if(f){
        this.prepare = prepare_level[level];
    }
}

global.Step_Transport = Step_Transport;