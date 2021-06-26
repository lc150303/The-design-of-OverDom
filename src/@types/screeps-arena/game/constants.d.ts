
type BodyPartConstant =
  | MOVE
  | WORK
  | CARRY
  | ATTACK
  | RANGED_ATTACK
  | TOUGH
  | HEAL
  | CLAIM;

type MOVE = "move";
type WORK = "work";
type CARRY = "carry";
type ATTACK = "attack";
type RANGED_ATTACK = "ranged_attack";
type TOUGH = "tough";
type HEAL = "heal";
type CLAIM = "claim";

type DirectionConstant =
  | TOP
  | TOP_RIGHT
  | RIGHT
  | BOTTOM_RIGHT
  | BOTTOM
  | BOTTOM_LEFT
  | LEFT
  | TOP_LEFT;

type TOP = 1;
type TOP_RIGHT = 2;
type RIGHT = 3;
type BOTTOM_RIGHT = 4;
type BOTTOM = 5;
type BOTTOM_LEFT = 6;
type LEFT = 7;
type TOP_LEFT = 8;

// Return Codes
type ScreepsReturnCode =
  | OK
  | ERR_NOT_OWNER
  | ERR_NO_PATH
  | ERR_BUSY
  | ERR_NAME_EXISTS
  | ERR_NOT_FOUND
  | ERR_NOT_ENOUGH_RESOURCES
  | ERR_NOT_ENOUGH_ENERGY
  | ERR_INVALID_TARGET
  | ERR_FULL
  | ERR_NOT_IN_RANGE
  | ERR_INVALID_ARGS
  | ERR_TIRED
  | ERR_NO_BODYPART
  | ERR_NOT_ENOUGH_EXTENSIONS
  | ERR_RCL_NOT_ENOUGH
  | ERR_GCL_NOT_ENOUGH;

type OK = 0;
type ERR_NOT_OWNER = -1;
type ERR_NO_PATH = -2;
type ERR_NAME_EXISTS = -3;
type ERR_BUSY = -4;
type ERR_NOT_FOUND = -5;
type ERR_NOT_ENOUGH_RESOURCES = -6;
type ERR_NOT_ENOUGH_ENERGY = -6;
type ERR_INVALID_TARGET = -7;
type ERR_FULL = -8;
type ERR_NOT_IN_RANGE = -9;
type ERR_INVALID_ARGS = -10;
type ERR_TIRED = -11;
type ERR_NO_BODYPART = -12;
type ERR_NOT_ENOUGH_EXTENSIONS = -6;
type ERR_RCL_NOT_ENOUGH = -14;
type ERR_GCL_NOT_ENOUGH = -15;

type CreepActionReturnCode =
  | OK
  | ERR_NOT_OWNER
  | ERR_BUSY
  | ERR_INVALID_TARGET
  | ERR_NOT_IN_RANGE
  | ERR_NO_BODYPART
  | ERR_TIRED;

type CreepMoveReturnCode =
  | OK
  | ERR_NOT_OWNER
  | ERR_BUSY
  | ERR_TIRED
  | ERR_NO_BODYPART;

type OBSTACLE_OBJECT_TYPES = ['creep', 'tower', 'constructedWall', 'spawn', 'extension', 'link'];

type TERRAIN_SWAMP = 2;
type TERRAIN_WALL = 1;

// import { RESOURCE_SCORE } from "arena";
type ResourceConstant = "energy" | RESOURCE_SCORE | RESOURCE_SCORE_XYZ;

type AnyCreep = Creep; /* | PowerCreep;*/

type BuildableStructureConstant =
  | STRUCTURE_TOWER
  | STRUCTURE_EXTENSION
  | STRUCTURE_ROAD
  | STRUCTURE_CONTAINER
  | STRUCTURE_WALL
  | STRUCTURE_RAMPART
  | STRUCTURE_SPAWN;

type BuildableStructure =
  | StructureTower
  | StructureExtension
  | StructureRoad
  | StructureContainer
  | StructureWall
  | StructureRampart
  | StructureSpawn;



declare module "game/constants" {
  // import {
  //   Creep,
  //   STRUCTURE_CONTAINER,
  //   STRUCTURE_EXTENSION,
  //   STRUCTURE_RAMPART,
  //   STRUCTURE_ROAD,
  //   STRUCTURE_SPAWN,
  //   STRUCTURE_TOWER,
  //   STRUCTURE_WALL,
  //   StructureContainer,
  //   StructureExtension,
  //   StructureRampart,
  //   StructureRoad,
  //   StructureSpawn,
  //   StructureTower,
  //   StructureWall
  // } from "game/prototypes";

  export const MOVE: MOVE;
  export const WORK: WORK;
  export const CARRY: CARRY;
  export const ATTACK: ATTACK;
  export const RANGED_ATTACK: RANGED_ATTACK;
  export const TOUGH: TOUGH;
  export const HEAL: HEAL;
  export const CLAIM: CLAIM;


  export const TOP: TOP;
  export const TOP_RIGHT: TOP_RIGHT;
  export const RIGHT: RIGHT;
  export const BOTTOM_RIGHT: BOTTOM_RIGHT;
  export const BOTTOM: BOTTOM;
  export const BOTTOM_LEFT: BOTTOM_LEFT;
  export const LEFT: LEFT;
  export const TOP_LEFT: TOP_LEFT;


  export const CARRY_CAPACITY: number;
  export const CREEP_SPAWN_TIME: number;

  export const ERR_BUSY: ERR_BUSY;
  export const ERR_FULL: ERR_FULL;
  export const ERR_INVALID_ARGS: ERR_INVALID_ARGS;
  export const ERR_INVALID_TARGET: ERR_INVALID_TARGET;
  export const ERR_NAME_EXISTS: ERR_NAME_EXISTS;
  export const ERR_NOT_ENOUGH_ENERGY: ERR_NOT_ENOUGH_ENERGY;
  export const ERR_NOT_ENOUGH_EXTENSIONS: ERR_NOT_ENOUGH_EXTENSIONS;
  export const ERR_NOT_ENOUGH_RESOURCES: ERR_NOT_ENOUGH_RESOURCES;
  export const ERR_NOT_FOUND: ERR_NOT_FOUND;
  export const ERR_NOT_IN_RANGE: ERR_NOT_IN_RANGE;
  export const ERR_NOT_OWNER: ERR_NOT_OWNER;
  export const ERR_NO_BODYPART: ERR_NO_BODYPART;
  export const ERR_NO_PATH: ERR_NO_PATH;
  export const ERR_TIRED: ERR_TIRED;
  export const OK: OK;

  export const OBSTACLE_OBJECT_TYPES: OBSTACLE_OBJECT_TYPES;
  export const RANGED_ATTACK_DISTANCE_RATE: any[];
  export const RANGED_ATTACK_POWER: number;
  export const HEAL_POWER: number;
  export const ATTACK_POWER: number;
  export const RANGED_HEAL_POWER: number;

  export const ROAD_WEAROUT: number;

  export const TERRAIN_SWAMP: TERRAIN_SWAMP;
  export const TERRAIN_WALL: TERRAIN_WALL;

  export const TOWER_CAPACITY: number;
  export const TOWER_ENERGY_COST: number;
  export const TOWER_FALLOFF: number;
  export const TOWER_FALLOFF_RANGE: number;
  export const TOWER_HITS: number;
  export const TOWER_OPTIMAL_RANGE: number;
  export const TOWER_POWER_ATTACK: number;
  export const TOWER_POWER_HEAL: number;
  export const TOWER_POWER_REPAIR: number;
  export const TOWER_RANGE: number;
  export const TOWER_COOLDOWN: number;

  export const RESOURCE_ENERGY: "energy";

  export const BODYPART_COST: { [index in BodyPartConstant]: number };
  export const BODYPART_HITS: number;

  export const DISMANTLE_COST: number;
  export const DISMANTLE_POWER: number;
  export const HARVEST_POWER: number;
  export const MAX_CREEP_SIZE: number;

  export const REPAIR_COST: number;
  export const REPAIR_POWER: number;
  // export const RESOURCES_ALL = ["energy"];

  export const RESOURCE_DECAY: number;
  export const SOURCE_ENERGY_REGEN: number;

  export const BUILD_POWER: number;

  export const CONSTRUCTION_COST_ROAD_SWAMP_RATIO: number;
  export const CONSTRUCTION_COST_ROAD_WALL_RATIO: number;
  export const CONTAINER_CAPACITY: number;
  export const CONTAINER_HITS: number;

  export const EXTENSION_ENERGY_CAPACITY: number;
  export const EXTENSION_HITS: number;
  export const MAX_CONSTRUCTION_SITES: number;

  export const CONSTRUCTION_COST: {
    StructureTower: number;
    StructureExtension: number;
    StructureRoad: number;
    StructureContainer: number;
    StructureWall: number;
    StructureRampart: number;
    StructureSpawnt: number;
  };

  export const RAMPART_HITS: number;
  export const RAMPART_HITS_MAX: number;
  export const ROAD_HITS: number;

  export const STRUCTURE_PROTOTYPES: {
    StructureTower: STRUCTURE_TOWER;
    StructureSpawn: STRUCTURE_SPAWN;
    StructureRoad: STRUCTURE_ROAD;
    StructureRampart: STRUCTURE_RAMPART;
    StructureExtension: STRUCTURE_EXTENSION;
    StructureWall: STRUCTURE_WALL;
    StructureContainer: STRUCTURE_CONTAINER;
  };

  export const WALL_HITS: number;
  export const WALL_HITS_MAX: number;
  export const SPAWN_ENERGY_CAPACITY: number;
  export const SPAWN_HITS: number;
}
