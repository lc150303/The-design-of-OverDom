
type STRUCTURE_CONTAINER = "container";
// export const STRUCTURE_CONTAINER: STRUCTURE_CONTAINER;
interface StructureContainer extends OwnedStructure<STRUCTURE_CONTAINER> {
  /**
   * A Store object that contains a cargo of this structure. Spawns can contain only energy.
   */
  store: Store<ResourceConstant>;
}
interface StructureContainerConstructor
  extends _Constructor<StructureContainer>,
  _ConstructorById<StructureContainer> { }


declare module "game/prototypes" {
  export const StructureContainer: StructureContainerConstructor;
}
