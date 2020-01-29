"use strict"

/**
 *  默认在range内时是OK
 *  接到步骤时要写入 step.creep_parts
 * 
 *  注：对建筑对象的获取基于极致建筑缓存
 */

/**
 *  acquire 备选函数，3级前捡地上的能量，4级开始不捡
 */

function nonpick(creep){
    /**
     *  只从建筑拿，来源肯定有store属性
     */
    let source = creep.room[this.src_of_this_round];
    if(!source || source.store[energy]<100){
        source = creep.pos.findClosestByRange(
            this.srcs.map((id)=>creep.room[id]).filter((s)=>s&&s.store[energy]>200)
        )
        this.src_of_this_round = source? source.id : undefined;
    }
    if(source){
        if(creep.pos.isNearTo(source)){
            creep.withdraw(source, energy);
            if(source.store[energy]+creep.store[energy] > 0.5*creep.store.getCapacity()){
                this.working = true;
                return this.perfrom(creep);
            }
        }else{
            creep.moveTo(source);
        }
    }else{
        this.expired = true;
        return ERR_NOT_ENOUGH_ENERGY;
    }
}

function pickable(creep){
    /**
     *  考虑掉地上的能量
     */
    let source = creep.room[this.src_of_this_round];
    if(!source || (source.store && source.store[energy]<100) || source.amount<10){
        source = creep.pos.findClosestByRange(
            creep.room.find(FIND_DROPPED_RESOURCES, {
                filter:{resourceType: energy}
            }).concat(this.srcs.map((id)=>creep.room[id]).filter((s)=>s&&s.store[energy]>200)) 
        )
        this.src_of_this_round = source? source.id : undefined;
    }
    if(source){
        if(creep.pos.isNearTo(source)){
            if(source.store){
                creep.withdraw(source, energy);
                if(source.store[energy]+creep.store[energy] > 0.5*creep.store.getCapacity()){
                    this.working = true;
                    return this.perfrom(creep);
                }
            }else{
                creep.pickup(source);
                if(source.amount+creep.store[energy] > 0.5*creep.store.getCapacity()){
                    this.working = true;
                    return this.perfrom(creep);
                }
            }
        }else{
            creep.moveTo(source);
        }
    }else{
        this.expired = true;
        return ERR_NOT_ENOUGH_ENERGY;
    }
}

/**
 *  多src单dst
 * 
 * @param {*} args {name, sources:Set([id]), destinations:id, amount, pick:bool}
 */
function Step_Repair(args){
    global.super(this, [Step_Labor], args);
    this.intended_amount = args.amount;
    this.finished_amount = 0;
    this.src_of_this_round;
    this.creep_parts;
    // 要不要捡地上的能量
    this.acquire = args.pick? pickable : nonpick;
}
inherit(Step_Repair, [Step_Labor]);

Step_Repair.prototype.perfrom = function(creep){
    if(!creep.store[energy]){
        // 身上空，保底防bug
        this.working = false;
        return this.acquire(creep);
    }
    
    let dst = creep.room[this.dsts];
    if(dst && dst.hits<dst.hitsMax){
        // valid dst
        if(creep.repair(dst) == OK){
            if(this.creep_parts>creep.store[energy]){
                this.working = false;
                this.finished_amount += creep.store[energy];
            }else{
                this.finished_amount += this.creep_parts;
            }

            // step 完成没
            if(this.finished_amount > this.intended_amount)
                this.finished = true;
            //return OK
            return this.working? OK : this.acquire(creep);
        }else{
            return creep.moveTo(dst);
        }
    }else{
        // no dst
        this.expired = true;
        return ERR_INVALID_TARGET;
    }
}

Step_Repair.prototype.prepare = function(creep){
    /**
     *  能量多就直接去干活
     */
    if(creep.store[energy] > 0.5*creep.store.getCapacity()){
        this.working = true;
    }else{
        this.working = false;
    }
    this.ready = true;
}

global.Step_Repair = Step_Repair;