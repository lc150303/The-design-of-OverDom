declare module "arena/prototypes" {
    import { GameObject, _Constructor } from "game/prototypes";
    export interface AreaEffect extends GameObject {
      /**
       * The type of the effect this has on creep. "freeze" or "damage".
       */
      effect: string;
      /**
       * The amount of game ticks when this effect will disappear. (undocumented)
       */
       ticksToDecay: number | undefined;
    }

    export const AreaEffect: _Constructor<AreaEffect>;
  }
