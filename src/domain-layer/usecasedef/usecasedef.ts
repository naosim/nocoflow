import { Domain, DomainId, valid } from "../domain/domain.ts";
import { Entity, EntityId } from "../entity/entity.ts";
import { IdFactory, StringValueObject } from "../lib/lib.ts";
import { UsecaseEntity } from "../usecase/usecase.ts";

export class Context {
  constructor(public readonly usecaseEntity: UsecaseEntity, public readonly entity?: Entity) {
  }
}

export class UsecaseFlowApiName {
  private _UsecaseFlowApiName = 'UsecaseFlowApiName';
  constructor(public readonly value: string) { }
}

export enum UsecaseFlowTaskType {
  initialize = 'initialize',
  finalize = 'finalize',
  wait = 'wait',
  process = 'process'
}

export class UsecaseFlowTaskDefId extends StringValueObject {
  private _UsecaseFlowTaskDefId = 'UsecaseFlowTaskDefId';
}

export class UsecaseFlowTaskDef {
  constructor(
    public readonly id: UsecaseFlowTaskDefId,
    public readonly type: UsecaseFlowTaskType,
    public readonly displayName: string,
    public readonly description: string,
    public readonly funcInit?: (context: Context) => UsecaseEntity,
    public readonly funcFinalize?: (context: Context) => Entity,
  ) { }
}

export class UsecaseFlowDefRepository {
  readonly values: UsecaseFlowDef[] = [];
  private usecaseFlowDefDecide: UsecaseFlowDefDecide | undefined;
  add(usecaseFlowDef: UsecaseFlowDef) {
    this.values.push(usecaseFlowDef);
  }
  find(usecaseFlowDefId: string): UsecaseFlowDef {
    return valid(this.values.find(usecaseFlowDef => usecaseFlowDef.id === usecaseFlowDefId));
  }
  findByApiName(apiName: UsecaseFlowApiName): UsecaseFlowDef {
    return valid(this.values.find(usecaseFlowDef => usecaseFlowDef.apiName.value === apiName.value));
  }
  setUsecaseFlowDefDecide(usecaseFlowDefDecide: UsecaseFlowDefDecide) {
    this.usecaseFlowDefDecide = usecaseFlowDefDecide;
  }
  getUsecaseFlowDefDecide(): UsecaseFlowDefDecide {
    return valid(this.usecaseFlowDefDecide);
  }
}

export class UsecaseFlowTaskDefDependency {
  constructor(
    public readonly fromTaskDefId: UsecaseFlowTaskDefId,
    public readonly toTaskDefId: UsecaseFlowTaskDefId,
  ) { }
}

export class UsecaseFlowDef {
  constructor(
    public readonly id: string,
    public readonly apiName: UsecaseFlowApiName,
    public readonly displayName: string,
    public readonly description: string,
    public readonly taskDefs: UsecaseFlowTaskDef[],
    public readonly taskDefDependencies: UsecaseFlowTaskDefDependency[],
  ) { }
  findTaskDef(taskDefId: UsecaseFlowTaskDefId): UsecaseFlowTaskDef {
    return valid(this.taskDefs.find(taskDef => taskDef.id.eqValue(taskDefId)));
  }
  findNextTaskDefs(taskDefId: UsecaseFlowTaskDefId): UsecaseFlowTaskDef[] {
    return this.taskDefDependencies.filter(taskDefDependency => taskDefDependency.fromTaskDefId.eqValue(taskDefId)).map(taskDefDependency => this.findTaskDef(taskDefDependency.toTaskDefId));
  }
}

export class UsecaseFlowDefDecide {
  constructor(
    public readonly func: (domain: Domain, input: any) => UsecaseFlowApiName,
  ) { }
  decide(domain: Domain, input: any): UsecaseFlowApiName {
    return this.func(domain, input);
  }
}