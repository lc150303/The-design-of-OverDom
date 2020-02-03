"use strict"

global.get_resource_type = function(store, types, inOrder){
    if(!store){
        return undefined;
    }
    if(!types){
        types = RESOURCES_ALL_SET;
    }
    if(inOrder){
        /**
         *  按照 types 的顺序
         */
        for(let type of types){
            if(store[type]){
                return type;
            }
        }
    }else{
        for(let type in store){
            if(types.has(type)){
                return type;
            }
        }
    }
    // return undefined;
}

global.getFreeCapacity = function(store, type){
    // 修复 storage.store.getFreeCapacity(type) > storage.store.getFreeCapacity() 的bug
    if(!store) return undefined;
    if(store.getCapacity()===null){
        return store.getFreeCapacity(type);
    }
    return store.getFreeCapacity();
}

global.serial_dst = function(creep, dst){
    let exit = creep.room.findExitTo(dst.roomName);
    return creep.pos.findClosestByPath(exit);
}

global.makeup_body = function(body_types){
    let assemble = {body:[], cost:0};
    for(let type of body_types){
        assemble.body.push(...Array(type[1]).fill(type[0]));
        assemble.cost += type[1]*BODYPART_COST[type[0]];
    }
    return assemble;
}

global.inherit = function(child, parents){
    Object.assign(child.prototype, ...parents.map((parent) => parent.prototype));
    child.prototype.constructor = child;
}

global.super = function(instance, parents, args){
    for(let parent of parents){
        parent.call(instance, args);
    }
}

global.colourful = function(string, colour){
    return `<text style="color: ${colours[colour]}">${string}</text>`;
}

global.energy_accumulator = function(temp_sum, target){
    return temp_sum + target.store[energy];
}

global.accumulator = function(type){
    if(RESOURCES_ALL_SET.has(type)){
        return (temp_sum, target) => temp_sum + target.store[type];
    }else{
        throw 'type should be RESOURCES_*'
    }
}

