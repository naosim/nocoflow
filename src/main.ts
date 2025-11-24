import { Domain, DomainId, DomainRepository } from "./domain-layer/domain/domain.ts";
import { Entity, EntityId } from "./domain-layer/entity/entity.ts";
import { CurrentTimeFactory, IdFactory } from "./domain-layer/lib/lib.ts";
import { UsecaseEntity, UsecaseEntityFactory, UsecaseEntityId, UsecaseFlow, UsecaseFlowId, UsecaseFlowRepository, UsecaseFlowTask, UsecaseFlowTaskId, UsecaseFlowTaskState } from "./domain-layer/usecase/usecase.ts";
import { Context, UsecaseFlowApiName, UsecaseFlowDef, UsecaseFlowDefDecide, UsecaseFlowDefRepository, UsecaseFlowTaskDef, UsecaseFlowTaskDefId, UsecaseFlowTaskType } from "./domain-layer/usecasedef/usecasedef.ts";


class Repositories {
  idFactory: IdFactory = new IncrementIdFactory();
  currentTimeFactory: CurrentTimeFactory = new CurrentTimeFactorySystemDate();
  domainRepository: DomainRepository = new DomainRepository();
  usecaseFlowDefRepository: UsecaseFlowDefRepository = new UsecaseFlowDefRepository();
  usecaseFlowRepository: UsecaseFlowRepository = new UsecaseFlowRepository();
  findEntity(entityId: EntityId): Entity {
    return new Entity(entityId, {});
  }
}

class NocoFlowRefer {
  constructor(
    public readonly repositories: Repositories,
    public readonly usecaseEntityFactory: UsecaseEntityFactory,
  ) { }

  allRunningUsecaseFlow(): UsecaseFlow[] {
    return this.repositories.usecaseFlowRepository.values;
  }

}

/**
 * NocoFlowのファサード
 */
class Nocoflow {
  idFactory: IdFactory;
  constructor(
    public readonly repositories: Repositories,
    public readonly usecaseEntityFactory: UsecaseEntityFactory,
    public readonly refer: NocoFlowRefer,
  ) {
    this.idFactory = this.repositories.idFactory;
  }
  addDomain(domain: Domain) {
    this.repositories.domainRepository.add(domain);
  }
  addUsecaseFlowDef(usecaseFlowDef: UsecaseFlowDef) {
    this.repositories.usecaseFlowDefRepository.add(usecaseFlowDef);
  }

  runNewUsecaseFlow(domainId: DomainId, input: any) {
    const domain = this.repositories.domainRepository.find(domainId);
    const usecaseEntity = new UsecaseEntity(
      new UsecaseEntityId(this.idFactory.create('UE')),
      domainId, {}, input
    );

    // usecaseflowを決定する
    const usecaseFlowApiName = this.repositories.usecaseFlowDefRepository.getUsecaseFlowDefDecide().decide(domain, input);
    const usecaseFlowDef = this.repositories.usecaseFlowDefRepository.findByApiName(usecaseFlowApiName);

    const tasks = usecaseFlowDef.taskDefs.map(v => {
      return new UsecaseFlowTask(
        new UsecaseFlowTaskId(this.idFactory.create('UFT')),
        domainId,
        usecaseEntity,
        v.id,
      )
    })

    const usecaseFlow = new UsecaseFlow(
      new UsecaseFlowId(this.idFactory.create('UF')),
      domainId,
      usecaseEntity,
      usecaseFlowDef.id,
      tasks);
    this.repositories.usecaseFlowRepository.add(usecaseFlow);
    this.repositories.usecaseFlowRepository.save(usecaseFlow);
    this.runUsecaseFlow(usecaseFlow);
  }
  // runModifyUsecaseFlow(domainId: DomainId, input: any, entityId: EntityId) {
  //   const domain = this.repositories.domainRepository.find(domainId);
  //   const entity = this.repositories.findEntity(entityId);
  //   const usecaseEntity = this.usecaseEntityFactory.createModify(domainId, entity, input);
  //   const usecaseFlow = new UsecaseFlow(this.idFactory.create('UF'), domainId, usecaseEntity);
  //   this.runOrRestartUsecaseFlow(usecaseFlow);
  // }

  restartAllUsecaseFlow() {

  }

  private runUsecaseFlow(usecaseFlow: UsecaseFlow) {
    usecaseFlow.start();
    this.repositories.usecaseFlowRepository.save(usecaseFlow);

    console.log(usecaseFlow);
  }

  loop() {
    const flows = this.repositories.usecaseFlowRepository.findAll().filter(v => v.hasAlreadyTask());
    for (const flow of flows) {
      const task = flow.alreadyTask();
      if (task) {
        task.state = UsecaseFlowTaskState.running;
        this.repositories.usecaseFlowRepository.save(flow);
        const usecaseFlowDef = this.repositories.usecaseFlowDefRepository.find(flow.usecaseFlowDefId);
        const taskDef = usecaseFlowDef.findTaskDef(task.taskDefId);
        if (taskDef.funcInit) {
          const entity = flow.usecaseEntity.entityId ? this.repositories.findEntity(flow.usecaseEntity.entityId) : undefined;
          taskDef.funcInit(new Context(flow.usecaseEntity, entity));
          task.state = UsecaseFlowTaskState.completed;
          console.log(task.id.value, 'completed');
          this.repositories.usecaseFlowRepository.save(flow);
        }
      }
    }

    setTimeout(() => this.loop(), 5000);
  }
}

class IncrementIdFactory implements IdFactory {
  count = 0;
  zerofill(num: number) {
    return num.toString().padStart(10, '0');
  }
  create(prefix: string): string {
    return prefix + this.zerofill(this.count++);
  }
}

class CurrentTimeFactorySystemDate implements CurrentTimeFactory {
  now(): Date {
    return new Date();
  }
}


//--


// const usecaseFactory = new UsecaseFactory(
//   (domain: Domain) => new UsecaseApiName('issue_new'),
//   (domain: Domain, Entity: Entity) => new UsecaseApiName('issue_modify'),
// );




// new FlowInitializeTaskDef(async (initializeContext: InitializeContext) => {
//   return new UsecaseEntity();
// })

const repositories = new Repositories();
const nocoflow = new Nocoflow(
  repositories,
  new UsecaseEntityFactory(repositories.idFactory),
  new NocoFlowRefer(repositories, new UsecaseEntityFactory(repositories.idFactory))
);
nocoflow.loop();
// ドメイン定義
const 課題ドメイン = new Domain(
  new DomainId(repositories.idFactory.create('DM')),
  'issue',
  '課題',
  '課題管理',
  {}
)
nocoflow.addDomain(課題ドメイン);

// ユースケース定義
const taskDefs = [
  new UsecaseFlowTaskDef(
    new UsecaseFlowTaskDefId(repositories.idFactory.create('UFTD')),
    UsecaseFlowTaskType.initialize,
    (context: Context): UsecaseEntity => {
      return context.usecaseEntity;
    }
  ),
  new UsecaseFlowTaskDef(
    new UsecaseFlowTaskDefId(repositories.idFactory.create('UFTD')),
    UsecaseFlowTaskType.finalize,
    undefined,
    (context: Context): Entity => {
      return new Entity(new EntityId(repositories.idFactory.create('E')), {});
    }
  ),
];
const usecaseFlowDef = new UsecaseFlowDef(repositories.idFactory.create('UF'), new UsecaseFlowApiName('issue_new'), '課題新規', '課題新規', taskDefs);
nocoflow.addUsecaseFlowDef(usecaseFlowDef);

// usecaseFlowDef決定
const usecaseFlowDefDecide = new UsecaseFlowDefDecide(
  (domain: Domain, input: any): UsecaseFlowApiName => {
    // console.log(domain, input)
    if (domain.apiName === 'issue' && input.action === 'new') {
      return new UsecaseFlowApiName('issue_new');
    }
    throw new Error('not found');
  }
);
nocoflow.repositories.usecaseFlowDefRepository.setUsecaseFlowDefDecide(usecaseFlowDefDecide);

console.log('expect:0', nocoflow.refer.allRunningUsecaseFlow().length);
nocoflow.runNewUsecaseFlow(課題ドメイン.id, { title: 'test', description: 'testだよ', assignee: 'nao', action: 'new' });
console.log('expect:1', nocoflow.refer.allRunningUsecaseFlow().length);
