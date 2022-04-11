declare module "arena/constants" {
  export type RESOURCE_SCORE = "score";
  export type RESOURCE_SCORE_X = "score_x";
  export type RESOURCE_SCORE_Y = "score_y";
  export type RESOURCE_SCORE_Z = "score_z";
  export type EFFECT_FREEZE = "freeze";
  export type EFFECT_HEAL = "heal";
  export type EFFECT_DAMAGE = "damage";

  export type ArenaResourceConstant = RESOURCE_SCORE | RESOURCE_SCORE_X | RESOURCE_SCORE_Y | RESOURCE_SCORE_Z;

  export const RESOURCE_SCORE: RESOURCE_SCORE;
  export const RESOURCE_SCORE_X: RESOURCE_SCORE_X;
  export const RESOURCE_SCORE_Y: RESOURCE_SCORE_Y;
  export const RESOURCE_SCORE_Z: RESOURCE_SCORE_Z;
  export const EFFECT_FREEZE: EFFECT_FREEZE;
  export const EFFECT_HEAL: EFFECT_HEAL;
  export const EFFECT_DAMAGE: EFFECT_DAMAGE;
}
