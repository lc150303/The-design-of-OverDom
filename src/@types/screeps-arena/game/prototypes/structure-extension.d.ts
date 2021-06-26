type STRUCTURE_EXTENSION = "extension";
// export const STRUCTURE_EXTENSION: STRUCTURE_EXTENSION;
interface StructureExtension extends OwnedStructure<STRUCTURE_EXTENSION> {
  /**
   * A Store object that contains a cargo of this structure. Spawns can contain only energy.
   */
  store: Store<ResourceConstant>;
}
interface StructureExtensionConstructor
  extends _Constructor<StructureExtension>,
  _ConstructorById<StructureExtension> { }


declare module "game/prototypes" {
  export const StructureExtension: StructureExtensionConstructor;
}
