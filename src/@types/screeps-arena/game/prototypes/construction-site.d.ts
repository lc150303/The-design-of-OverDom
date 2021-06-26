interface ConstructionSite extends GameObject {
  readonly prototype: ConstructionSite;

  /**
   * The current construction progress.
   */
  progress: number;
  /**
   * The total construction progress needed for the structure to be built.
   */
  progressTotal: number;

  /**
   * One of the STRUCTURE_PROTOTYPES entries
   */
  structure: Structure;

  // TODO: ConstructionSite object now has a new property structure that links to the corresponding Structure object.
  // It will be the live object instance that will appear when the construction site is completed. You can check what structure is being constructed using the instanceof operator:

  /**
   * Whether it is your construction site.
   */
  my: boolean;

  remove(): ERR_NOT_OWNER | OK;
}

interface ConstructionSiteConstructor
  extends _Constructor<ConstructionSite>,
  _ConstructorById<ConstructionSite> { }

declare module "game/prototypes" {
  export const ConstructionSite: ConstructionSiteConstructor;
}
