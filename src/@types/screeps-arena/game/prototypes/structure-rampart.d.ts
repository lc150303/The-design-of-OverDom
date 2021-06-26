interface StructureRampart extends OwnedStructure<STRUCTURE_RAMPART> { }

interface StructureRampartConstructor extends _Constructor<StructureRampart>, _ConstructorById<StructureRampart> { }
type STRUCTURE_RAMPART = "rampart";

declare module "game/prototypes" {
  export const StructureRampart: StructureRampartConstructor;
}
