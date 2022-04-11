declare module "game/prototypes" {
  import type { ResourceConstant } from 'game/constants';
  export interface Resource extends GameObject {
    readonly prototype: Resource;
    amount: number;
    resourceType: ResourceConstant;
    // TODO: fix toJSON
    // toJSON() {
    //   return Object.assign(super.toJSON(), {
    //     amount: this.amount,
    //     resourceType: this.resourceType
    //   });
    // }
  }

  export const Resource: _Constructor<Resource>;
}
