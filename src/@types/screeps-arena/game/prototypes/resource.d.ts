
interface Resource extends GameObject {
  readonly prototype: Resource;
  amount: number;
  resourceType: "energy"; // TODO: fix
  // TODO: fix toJSON
  // toJSON() {
  //   return Object.assign(super.toJSON(), {
  //     amount: this.amount,
  //     resourceType: this.resourceType
  //   });
  // }
}


declare module "game/prototypes" {
  export const Resource: _Constructor<Resource>;
}
