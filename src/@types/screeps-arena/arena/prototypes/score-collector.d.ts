declare module "arena/prototypes" {
  import { GameObject, _Constructor } from "game/prototypes";
  export interface ScoreCollector extends GameObject {
    /**
     * The type of the resource this collector accepts.
     */
    resourceType: string;
    /**
     * Whether you have control over this collector.
     */
    my: boolean;
    /**
     * Current collected score number of the owner player.
     */
    score: number;
    /**
     * Total number of score needed to win instantly.
     */
    scoreTotal: number;
  }

  export const ScoreCollector: _Constructor<ScoreCollector>;
}
