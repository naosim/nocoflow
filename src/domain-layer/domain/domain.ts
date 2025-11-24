export class DomainId {
  private _DomainId = 'DomainId';
  constructor(public readonly value: string) { }
}

export class Domain {
  constructor(
    public readonly id: DomainId,
    public readonly apiName: string,
    public readonly displayName: string,
    public readonly description: string,
    public userData: any
  ) { }
}

export function valid<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('value is undefined');
  }
  return value;
}

export class DomainRepository {
  readonly values: Domain[] = [];
  add(domain: Domain) {
    this.values.push(domain);
  }
  find(domainId: DomainId): Domain {
    return valid(this.values.find(domain => domain.id.value === domainId.value));
  }
}
