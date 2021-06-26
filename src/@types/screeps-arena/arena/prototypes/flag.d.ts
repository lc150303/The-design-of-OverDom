
interface Flag extends GameObject {
  readonly prototype: Flag;
  /**
   * Equals to true or false if the flag is owned.
   * Returns undefined if it is neutral.
   */
  my: boolean | undefined;
}

interface FlagConstructor extends _Constructor<Flag>, _ConstructorById<Flag> { }

declare module "arena/prototypes" {
  export const Flag: FlagConstructor;
}
