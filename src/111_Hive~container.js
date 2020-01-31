"use strict"

/**
 *  source旁的container在没storage时充当杂物筐
 *  source旁和controller旁container在有附近有link后失去角色
 *  无角色的container不再被维护(repair)
 * 
 *  问题：
 *  1.up和mine没用集合
 *  2.maintain_set用了delete
 * 
 *  TODO:
 *  1.
 * 
 * @param {*} Hive 
 * @param {*} room 
 */
function Container_Manager(Hive, room){
    this.name = Hive.name;
    this.Hive = Hive;
    this.amount_per_task = room.level*200;

    this.source_containers;  
    this.mineral_containers;
    this.upgrade_containers;

    this.up_clear_pubed = 0;    // 任务记录
    this.up_fill_pubed = 0;
    this.src_clear_pubed = {};
    this.mine_clear_pubed = 0;

    this.maintain_set = {}; // 维护集合，记录需要维护的container
    this.repair_pubed = {}; // 维修任务记录

    this._sort_containers(room);
}

Container_Manager.prototype._sort_containers = function(room){
    /**
     *  存id，初始化任务记录
     *  把新增container加入维护集合
     */
    this.source_containers = new Set();  
    this.mineral_containers = [];
    this.upgrade_containers = [];
    for(let container of room.container){
        let id = container.id;
        if(container.pos.inRangeTo(room.controller, 4)){
            this.upgrade_containers.push(id);
            if(!id in this.maintain_set){
                this.maintain_set[id] = false;
                this.repair_pubed[id] = 0;
            }
        }else if(container.pos.findInRange(room.source, 1)){
            this.source_containers.add(id);
            if(!id in this.maintain_set){
                this.maintain_set[id] = false;
                this.repair_pubed[id] = 0;
            }
            if(!id in this.src_clear_pubed)
                this.src_clear_pubed[id] = 0;
        }else if(container.pos.inRangeTo(room.mineral, 1)){
            this.mineral_containers.push(id);
            if(!id in this.maintain_set){
                this.maintain_set[id] = false;
                this.repair_pubed[id] = 0;
            }
        }
    }
}

/**
 *  造好新container时从这里加入管理
 */
Container_Manager.prototype.update = function(){
    let room = Game.rooms[this.name];
    room.update(STRUCTURE_CONTAINER);
    this._sort_containers(room);
    for(let id in this.maintain_set){
        // 清除旧记录
        if(this.source_containers.has(id) || this.mineral_containers[0]==id || this.upgrade_containers[0]==id){
            continue;
        }
        delete this.maintain_set[id];
        delete this.repair_pubed[id];
    }
}

/**
 *  管理升级用的container
 */
Container_Manager.prototype.manage_upgrade = function(){
    let tasks = new List();
    let room = Game.rooms[this.name];
    let up_con = room[this.upgrade_containers[0]];
    if(up_con && room.mass_stores.length){
        if(up_con.store.getUsedCapacity() - container.store[energy] >= 500 
        && this.up_clear_pubed<=0){
            let types = new Set(Object.keys(up_con.store)).delete(energy);
            let step_args = {
                name: this.name+': clear up_con',
                sources: up_con.id,
                destinations: room.mass_stores,
                types: types,
                amount: 500
            };
            let task = new Task({
                steps: new Step_Transport_12m(step_args),
                name: step_args.name
            });
            task.is_expired = ()=>{
                let up_con = Game.rooms[this.name][step_args.sources];
                return !up_con || up_con.store.getUsedCapacity()-up_con.store[energy] < 50;
            };
            task.notify = ()=>{
                this.up_clear_pubed--;
                this.manage_upgrade();
            }
            tasks.push(task);
            this.up_clear_pubed++;
            //console.log(colourful(task.name+' pubed', '浅黄'));
        }
        if(this.up_fill_pubed<=0 && container.store[energy] < 500){
            for(let i=0; i*this.amount_per_task<1000; i++){
                let step_args = {
                    name: this.name+': fill up_con',
                    sources: room.mass_stores, 
                    destinations: up_con.id,
                    types: new Set(energy),
                    amount: this.amount_per_task
                };
                let task = new Task({
                    steps: new Step_Transport_m21(step_args),
                    name: step_args.name
                });
                task.is_expired = ()=>{
                    let up_con = Game.rooms[this.name][step_args.sources];
                    return !up_con || up_con.store[energy] > 1500;
                };
                task.notify = ()=>{
                    this.up_fill_pubed--;
                }
                tasks.push(task);
                this.up_fill_pubed++;
            }
        }
    }
    return tasks;
}

Container_Manager.prototype.manage_mineral = function(){
    if(this.mine_clear_pubed>0)
        return undefined;

    let room = Game.rooms[this.name];
    let mine_con = room[this.mineral_containers[0]];
    if(mine_con && room.mass_stores.length){
        let step_args = {
            name: this.name+': clear mine_con',
            sources: mine_con.id,
            destinations: room.mass_stores,
            types: new Set(Object.keys(mine_con.store)),
            amount: this.amount_per_task
        };
        let task = new Task({
            steps: new Step_Transport_12m(step_args),
            name: step_args.name
        });
        task.is_expired = ()=>{
            let mine_con = Game.rooms[this.name][step_args.sources];
            return !mine_con || mine_con.store.getUsedCapacity() < 200;
        };
        task.notify = ()=>{
            this.mine_clear_pubed--;
        }
        this.mine_clear_pubed++;
        //console.log(colourful(this.name+' '+task.name+' pubed', '浅黄'));
        return task;
    }
}

Container_Manager.prototype.manage_source = function(){
    let room = Game.rooms[this.name];
    let tasks = new List();
    if(room.storage || room.terminal){
        for(let id of this.source_containers){
            let source_con = room[id];
            if(source_con){
                if(this.src_clear_pubed[id]<=0 && source_con.store.getUsedCapacity()>1000){
                    let types = Object.keys(source_con.store);
                    for(let i=0; i*this.amount_per_task<1000; i++){
                        let step_args = {
                            name: this.name+': clear src_con',
                            sources: id,
                            destinations: room.mass_stores, 
                            types: new Set(types),
                            amount: this.amount_per_task
                        };
                        let task = new Task({
                            steps: new Step_Transport_12m(step_args),
                            name: step_args.name
                        });
                        task.is_expired = ()=>{
                            let src_con = Game.rooms[this.name][id];
                            return !src_con || src_con.store.getUsedCapacity()<100;
                        };
                        task.notify = ()=>{
                            this.src_clear_pubed[id]--;
                        }
                        tasks.push(task);
                        this.src_clear_pubed[id]++;
                    }
                }
            }else{
                this.source_containers.delete(id);
            }
        }
    }
    return tasks;
}

/**
 *  管理container的维修
 *  如果需要维修则发布维修任务
 *  否则提交定时事件，在合适的时间触发重新检查
 */
Container_Manager.prototype.maintain_single = function(id){
    let room = Game.rooms[this.name];
    let container = room[id];
    if(container){
        if(this.repair_pubed[id]<=0 && container.hits < container.hitsMax-CONTAINER_THRESHOLD){
            // 发布维修任务
            if(id in this.maintain_set){
                let step_args = {
                    name: this.name+': repair container',
                    sources: [container.id].concat(Array.from(this.Hive.mass_stores)),
                    destinations: container.id,
                    amount: CONTAINER_STEP_SIZE
                };
                let task = new Task({
                    steps: new Step_Repair(step_args),
                    name: step_args.name
                });
                task.notify = ()=>{
                    this.repair_pubed[id]--;
                    this.maintain_single(id);
                };
                this.repair_pubed[id]++;
                this.Hive.task_queues.repair.push(task);
            }
        }else{
            // 发布定时事件
            let event_args = {
                name: this.name+' maintain container',
                id: id,
                time: Game.time+Math.round(
                    CONTAINER_DECAY_TIME_OWNED*(container.hits-CONTAINER_THRESHOLD)/CONTAINER_DECAY
                    ),
                invoke: ()=>{this.maintain_single(id);}
            }
            this.Hive.event_queue.insert(new Event(event_args));
        }
    }else{
        if(this.upgrade_containers[0] == id){
            this.upgrade_containers = [];
        }else if(this.mineral_containers[0] == id){
            this.mineral_containers = [];
        }else{
            this.source_containers.delete(id);
        }
        delete this.maintain_set[id];
        delete this.repair_pubed[id];
    }
}

/**
 *  启动维修事件链
 */
Container_Manager.prototype.start_maintainance = function(){
    for(let id in this.maintain_set){
        if(this.maintain_set[id]){
            this.maintain_set[id] = true;
            this.maintain_single(id);
        }
    }
}

module.exports = Container_Manager;