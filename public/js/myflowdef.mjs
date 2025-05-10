import { FlowDef, TaskDef, FlowDefRepository } from "./flowdef.mjs";


// フローを定義する
// json形式で定義することにより、保存可能にする
export const flowDefsJson = [{
  "id": "fd_mo",
  "name": "朝の流れ",
  "taskDefs": [
    {
      "id": "001",
      "type": "start"
    },
    {
      "id": "002",
      "name": "起床",
      "type": "manual",
      "fromIds": ["001"]
    },
    {
      "id": "004",
      "name": "コーヒー豆挽き完了待ち",
      "type": "wait",
      "fromIds": ["001"],
      "isCompletedForWait": "(cp) => cp.payload.coffeeBeanGrindComplete"
    },
    {
      "id": "999",
      "type": "end",
      "fromIds": ["002", "004"]
    }
  ]
}]
//export const flowDefRepository = FlowDefRepository.createFromJsonObject(flowDefsJson);
// export const flowDef = FlowDef.createFromJsonObject(flowDefJson);