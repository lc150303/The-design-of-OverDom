
type STRUCTURE_SCORE_COLLECTOR = "constructedWall";
interface ScoreCollector
  extends OwnedStructure<STRUCTURE_SCORE_COLLECTOR> {
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

declare module "arena/prototypes" {
  export const ScoreCollector: _Constructor<ScoreCollector>;
}
