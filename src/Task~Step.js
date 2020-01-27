"use strict"

/**
 *  basic object of task steps
 * 
 * @param {object} args {name}
 */
function Step(args){
    this.finished = false;
    this.expired = false;
    this.name = args.name;
    //this.ready = false;
}

/*
Step.prototype.set_prepare = function(action){
    if(typeof(action) == 'function')
    this.prepare = action;
}

Step.prototype.prepare = function(creep){
    console.log('step.prepare not defined: '+this.name);
    this.ready = true;
}
*/
Step.prototype.inform_unqualified = function(){
    console.log('step.inform_unqualified not defined: '+this.name);
}

Step.prototype.set_infom_when_unqualified = function(callback){
    this.inform_unqualified = callback;
}

Step.prototype.is_expired = function(){
    /**
     *  用于复杂expire条件时重写
     */
    return this.expired;
}


/**
 *  basic object of step of build\carry\repair
 *  单creep的step
 * 
 * @param {object} args {name, sources:Set(id), destinations:Set(id)}
 */
function Step_Labor(args){
    global.super(this, [Step], args);
    this.srcs = args.sources;
    this.dsts = args.destinations;
    this.working = false;
    this.ready = false;
}

inherit(Step_Labor, [Step]);

let work_prepared = function(creep){
    if(this.working){
        this.perform(creep);
    }else{
        this.acquire(creep);
    }
}

Step_Labor.prototype.work = function(creep){
    /**
     *  step 在执行时的唯一接口
     */
    if(!this.ready){
        this.prepare(creep);
    }
    if(this.ready){
        this.work = work_prepared;
        return this.work(creep);
    }
}

Step_Labor.prototype.prepare = function(creep){
    console.log('step_labor.prepare not defined, '+creep.name+', '+this.srcs);
    this.finished = true;
}

Step_Labor.prototype.perform = function(creep){
    console.log('step_labor.perform not defined, '+creep.name+', '+this.srcs);
    this.finished = true;
}

Step_Labor.prototype.acquire = function(creep){
    console.log('step_labor.acquire not defined, '+creep.name+', '+this.srcs);
    this.working = true;
}

global.Step_Labor = Step_Labor;