export interface IdFactory {
  create(prefix: string): string;
}

export interface CurrentTimeFactory {
  now(): Date;
}

export class ValueObject<T> {
  constructor(public readonly value: T) { }
  eqValue(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}

export class StringValueObject extends ValueObject<string> {
}