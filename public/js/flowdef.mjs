

export class ContextAndPlayLoad {
  context;
  payload;
  constructor({context, payload}) {
    this.context = context;
    this.payload = payload;
  }
}

export class TaskType {
  value;
  constructor(value) {
    this.value = value;
  }
  eq(other) {
    return this.value === other.value;
  }
  static MANUAL = new TaskType("manual");
  static START = new TaskType("start");
  static END = new TaskType("end");
  static WAIT = new TaskType("wait");
  static PROCESS = new TaskType("process");
  static MILESTONE = new TaskType("milestone");
  static FLOW_TASK = new TaskType("flowtask");
}

export class TaskDef {
  id;
  /** @type {TaskType} */
  type;
  name;
  /** @type {string[]} */
  fromIds;
  /** @type {(cp:ContextAndPlayLoad)=>boolean} */
  executionCondition = (cp) => true;
  /** @type {(cp:ContextAndPlayLoad)=>void} */
  process = (cp) => {};
  /** @type {(cp:ContextAndPlayLoad)=>boolean} */
  isCompletedForWait;
  isSkip() {
    return !this.executionCondition();
  }

  /**
   * 
   * @param {{id:string, type:TaskType, name:string, fromIds:string[], executionCondition:(cp:ContextAndPlayLoad)=>boolean, process:(cp:ContextAndPlayLoad)=>void, isCompletedForWait:(cp:ContextAndPlayLoad)=>boolean}} param0 
   */
  constructor({
    id, type, name, fromIds, executionCondition, process, isCompletedForWait
  }) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.fromIds = fromIds;
    this.executionCondition = executionCondition;
    this.process = process;
    this.isCompletedForWait = isCompletedForWait || ((cp) => false);
  }

  static start({id}) {
    return new TaskDef({
      id,
      type: TaskType.START,
      name: TaskType.START.value,
      fromIds: [],
      executionCondition: (cp) => true,
      process: (cp) => {}
    });
  }

  static manual({id, name, fromIds, executionCondition}) {
    return new TaskDef({
      id,
      type: TaskType.MANUAL,
      name,
      fromIds,
      executionCondition: executionCondition || ((cp) => true),
      process: (cp) => {}
    });
  }

  static end({id, fromIds}) {
    return new TaskDef({
      id,
      type: TaskType.END,
      name: TaskType.END.value,
      fromIds,
      executionCondition: (cp) => true,
      process: (cp) => {}
    });
  }
  /**
   * 
   * @param {{id:string, name:string, fromIds:string[], executionCondition:(cp:ContextAndPlayLoad)=>boolean, isCompleted:(cp:ContextAndPlayLoad)=>boolean}} param0 
   * @returns 
   */
  static wait({id, name, fromIds, executionCondition, isCompletedForWait}) {
    return new TaskDef({
      id,
      type: TaskType.WAIT,
      name,
      fromIds,
      executionCondition: executionCondition || ((cp) => true),
      isCompletedForWait,
    });
  }

  static process({id, name, fromIds, executionCondition, process}) {
    return new TaskDef({
      id,
      type: TaskType.PROCESS,
      name,
      fromIds,
      executionCondition: executionCondition || ((cp) => true),
      process
    });
  }

  static milestone({id, name, fromIds}) {
    return new TaskDef({
      id,
      type: TaskType.MILESTONE,
      name,
      fromIds,
      executionCondition: (cp) => true,
      process: (cp) => {}
    });
  }
}

export class FlowDef {
  id;
  name;
  constructor({
    id, name, taskDefs
  }) {
    this.id = id;
    this.name = name;
    this.taskDefs = taskDefs;
  }

  /** @type {(cp:ContextAndPlayLoad)=>boolean} */
  executionCondition = (cp) => true;
  isSkip(cp) {
    return !this.executionCondition(cp);
  }

  static createFromJsonObject(json) {
    json.taskDefs = json.taskDefs
      .map(taskDef => {
        ["executionCondition", "process","isCompletedForWait"].forEach(key => {
          if(taskDef[key]) {
            taskDef[key] = eval(taskDef[key]);
          }
        })
        return taskDef;
      })
      .map(taskDef => {
        switch (taskDef.type) {
          case "start":
            return TaskDef.start(taskDef);
          case "manual":
            return TaskDef.manual(taskDef);
          case "wait":
            return TaskDef.wait(taskDef);
          case "end":
            return TaskDef.end(taskDef);
          default:
            throw new Error(`Unknown task type: ${taskDef.type}`);
        }
      });

    return new FlowDef(json)
  }
}

export class FlowDefRepository {
  map = {};
  add(flowDef) {
    this.map[flowDef.id] = flowDef;
  }
  findById(id) {
    return this.map[id];
  }
  all() {
    return Object.values(this.map);
  }
  /**
   * 
   * @param {any[]} json 
   */
  static createFromJsonObject(json) {
    var r = new FlowDefRepository();
    json.forEach(flowDefJson => {
      var flowDef = FlowDef.createFromJsonObject(flowDefJson);
      r.add(flowDef);
    });
    return r;
  }
}