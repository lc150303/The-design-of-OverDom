
interface BodyPart extends GameObject {
  readonly prototype: BodyPart;
  /**
   * The type of the body part.
   */
  type: BodyPartConstant;
  /**
   * The number of ticks until this item disappears.
   */
  ticksToDecay: number;
}
interface BodyPartConstructor extends _Constructor<BodyPart>, _ConstructorById<BodyPart> { }

declare module "arena/prototypes" {
  export const BodyPart: BodyPartConstructor;
}
