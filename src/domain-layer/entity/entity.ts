import { StringValueObject } from "../lib/lib.ts";

export class Entity {
  constructor(
    public readonly id: EntityId,
    public userData: any,
  ) { }
}

export class EntityId extends StringValueObject {
  private _EntityId = 'EntityId';
}
