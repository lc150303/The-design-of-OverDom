/// <reference path="utils.d.ts" />
/// <reference path="path-finder.d.ts" />
/// <reference path="constants.d.ts" />
/// <reference path="prototypes/index.d.ts" />
/// <reference path="visual.d.ts" />

declare module "game" {
  import { ERR_BUSY, ERR_INVALID_ARGS, ERR_NOT_ENOUGH_ENERGY } from "game/constants";
  import { Structure } from "game/prototypes";

  export * from "game/utils";

  export * as pathFinder from "game/path-finder";

  export * as prototypes from "game/prototypes";

  export * as constants from "game/constants";

  export * as visual from "game/visual";

  export const arenaInfo: {
    /**
     * The name of the arena. "Capture the Flag", "Spawn and Swamp", "Collect and Control"
     */
    name: string;
    /**
     * Currently equals to 1 for basic arena and 2 for advanced.
     */
    level: number;
    /**
     * Currently equals to "alpha".
     */
    season: string;
    /**
     * Game ticks limit.
     */
    ticksLimit: number;
    /**
     * CPU wall time execution limit per one tick (except the first tick).
     */
    cpuTimeLimit: number;
    /**
     * CPU wall time limit on the first tick.
     */
    cpuTimeLimitFirstTick: number;
  };

  export function createConstructionSite(x: number, y: number, structurePrototype: string /*STRUCTURE_PROTOTYPES*/):
  { object?: Structure; error?: ERR_BUSY | ERR_INVALID_ARGS | ERR_NOT_ENOUGH_ENERGY };
}
