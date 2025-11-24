import { Domain, DomainId, valid } from "../domain/domain.ts";
import { Entity, EntityId } from "../entity/entity.ts";
import { IdFactory, StringValueObject } from "../lib/lib.ts";
import { UsecaseFlowTaskDefId } from "../usecasedef/usecasedef.ts";

export class UsecaseFlowId extends StringValueObject {
  private _UsecaseFlowId = 'UsecaseFlowId';
}

export class UsecaseFlowRepository {
  readonly values: UsecaseFlow[] = [];
  add(usecaseFlow: UsecaseFlow) {
    this.values.push(usecaseFlow);
  }
  find(usecaseFlowId: UsecaseFlowId): UsecaseFlow {
    return valid(this.values.find(usecaseFlow => usecaseFlow.id.eqValue(usecaseFlowId)));
  }
  findAll() {
    return this.values;
  }
  // findTasksByState(state: UsecaseFlowTaskState): UsecaseFlowTask[] {
  //   var result: UsecaseFlowTask[] = [];
  //   for (const usecaseFlow of this.values) {
  //     result.push(...usecaseFlow.tasks.filter(task => task.state === state));
  //   }
  //   return result;
  // }
  save(usecaseFlow: UsecaseFlow) {
    console.log("未実装");

  }
}

export enum UsecaseFlowState {
  running,
  completed,
}

/**
 * ユースケースフロー
 * エンティティの作成/更新/削除を行う処理
 */
export class UsecaseFlow {
  public state = UsecaseFlowState.running
  constructor(
    public readonly id: UsecaseFlowId,
    public readonly domainId: DomainId,
    public readonly usecaseEntity: UsecaseEntity,
    public readonly usecaseFlowDefId: string,
    public readonly tasks: UsecaseFlowTask[],
  ) { }

  start() {
    this.tasks[0].state = UsecaseFlowTaskState.already;
  }

  hasAlreadyTask() {
    return this.tasks.some(task => task.state === UsecaseFlowTaskState.already);
  }
  alreadyTask() {
    return this.tasks.find(task => task.state === UsecaseFlowTaskState.already);// 複数あっても1つ返す
  }
}
export enum UsecaseFlowTaskState {
  pending,
  already,
  running,
  completed,
  error,
  skipped,
}

export class UsecaseFlowTaskId extends StringValueObject {
  private _UsecaseFlowTaskId = 'UsecaseFlowTaskId';
}

export class UsecaseFlowTask {
  public state = UsecaseFlowTaskState.pending
  constructor(
    public readonly id: UsecaseFlowTaskId,
    public readonly domainId: DomainId,
    public readonly usecaseEntity: UsecaseEntity,
    public readonly taskDefId: UsecaseFlowTaskDefId,
  ) { }
}

export class UsecaseEntityId extends StringValueObject {
  private _UsecaseEntityId = 'UsecaseEntityId';
}

/**
 * ユースケースフローの処理中エンティティ
 */
export class UsecaseEntity {
  constructor(
    public readonly id: UsecaseEntityId,
    public readonly domainId: DomainId,
    public userData: any,
    public input: any,
    public readonly entityId?: EntityId,
  ) { }
}


export class UsecaseEntityFactory {
  constructor(
    public readonly idFactory: IdFactory,
  ) { }
  createModify(domainId: DomainId, entity: Entity, input: any): UsecaseEntity {
    // TODO: your code
    return new UsecaseEntity(
      new UsecaseEntityId(this.idFactory.create('UE')),
      domainId, {}, input
    );
  }
}


// class UsecaseFlowFactory {
//   createModify(domain: Domain, Entity: Entity): UsecaseEntity {
//     new UsecaseFlow(this.idFactory.create('UF'), domainId, usecaseEntity
//     return this.createModifyUsecaseDef(domain, Entity);
//   }
// }
