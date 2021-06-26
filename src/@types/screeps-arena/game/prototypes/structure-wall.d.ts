
type STRUCTURE_WALL = "constructedWall";
// export const STRUCTURE_WALL: STRUCTURE_WALL;
interface StructureWall extends Structure<STRUCTURE_WALL> {
  readonly prototype: StructureWall;
}

interface StructureWallConstructor extends _Constructor<StructureWall>, _ConstructorById<StructureWall> { }


declare module "game/prototypes" {
  export const StructureWall: StructureWallConstructor;
}
