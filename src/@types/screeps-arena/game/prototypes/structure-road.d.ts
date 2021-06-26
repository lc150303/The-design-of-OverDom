
type STRUCTURE_ROAD = "road";
// export const STRUCTURE_ROAD: STRUCTURE_ROAD;
interface StructureRoad extends Structure<STRUCTURE_ROAD> {
  readonly prototype: StructureRoad;
}

interface StructureRoadConstructor extends _Constructor<StructureRoad>, _ConstructorById<StructureRoad> { }

declare module "game/prototypes" {
  export const StructureRoad: StructureRoadConstructor;
}
