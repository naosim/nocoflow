import fs from 'node:fs/promises';
import path from 'path';
class Countup {
  count = 1;
  prefix: string;
  zeroText = "000";
  zeroLength = 3;
  constructor(prefix: string) {
    console.log("prefix", prefix);
    this.prefix = prefix;
  }
  add() {
    this.count++;
    return this.getCount();
  }
  getCount() {
    return this.prefix + (`${this.zeroText}${this.count}`).slice(-this.zeroLength);
  }
}

const data:[string, Function][] = [
  ["contextdef/_list.json", () => [{"systemId":"contextdef"}]],
  ["contextdef/contextdef.json", () => {
    const countup = new Countup("ctd-c-");
    return {
      "_systemId":"contextdef",
      "_id":"issue",
      "_displayName":"課題",
      "_description":"課題の説明",
      "columns":[
        {
          "_systemId":"ctd-c-systemId",
          "_id":"_systemId",
          "_displayName":"システムID",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"_id",
          "_displayName":"課題ID",
          "type":"string"
        },
        {
          "_systemId":countup.add(),
          "_id":"_displayName",
          "_displayName":"件名",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"_description",
          "_displayName":"内容",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"_status",
          "_displayName":"ステータス",
          "type":"string",
          "enum": ["未着手", "対応中", "完了"]
        },
        {
          "_systemId":countup.add(),
          "_id":"result",
          "_displayName":"結果",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"createdBy",
          "_displayName":"起票者",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"assignedTo",
          "_displayName":"担当者",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"_createdAt",
          "_displayName":"作成日時",
          "type":"Date"
        },
        {
          "_systemId":countup.add(),
          "_id":"_updateAt",
          "_displayName":"更新日時",
          "type":"Date"
        },
      ]
    };
  }],
  ["context/_list.json", ()=> [{"_systemId":"c001"}]],
  ["context/c001.json", ()=> ({
    "_systemId":"c001",
    "_id":"c001",
    "_displayName":"動かない",
    "_description":"ボタンを押しても反応しない",
    "_status":"未着手",
  })],
  ["payloaddef/payloaddef.json", () => {
    const countup = new Countup("pd-c-");
    return {
      _systemId: "pd_001",
      _id: "pd_001",
      _displayName: "課題更新",
      _description: "課題の追加/更新/削除",
      "columns":[
        {
          "_systemId":"pd-c-systemId",
          "_id":"_systemId",
          "_displayName":"システムID",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"_id",
          "_displayName":"課題更新ID",
          "type":"string"
        },
        {
          "_systemId":countup.add(),
          "_id":"_displayName",
          "_displayName":"課題更新",
          "type":"string",
        },
        {
          "_systemId":countup.add(),
          "_id":"createdUserFlag",
          "_displayName":"起票者記入済みフラグ",
          "type":"boolean",
        },
        {
          "_systemId":countup.add(),
          "_id":"assignedFlag",
          "_displayName":"担当者記入済みフラグ",
          "type":"boolean",
        },
      ]
    }
  }],
  ["flowdef/_list.json", () => [{"_systemId":"fd001"}]],
  ["flowdef/fd001.json", () => {
    const countup = new Countup("fd-t-");
    return {
      "_systemId":"fd001.json",
      "_id":"fd001.json",
      "_displayName":"新規作成",
      "type": "create", // create / update / delete
      "forms": [
        {
          "_systemId":countup.add(),
          "_id":"_displayName",
          "_displayName":"件名",
          "type":"string",
          "mapping":"context._displayName"
        },
        {
          "_systemId":countup.add(),
          "_id":"_description",
          "_displayName":"内容",
          "type":"string",
          "inputType":"textarea",
          "mapping":"context._description"
        },
        {
          "_systemId":countup.add(),
          "_id":"_status",
          "_displayName":"ステータス",
          "type":"string",
          "value":"未着手",
          "enum": ["未着手", "対応中", "完了"],
          "mapping":"context._status"
        },
        {
          "_systemId":countup.add(),
          "_id":"createdBy",
          "_displayName":"起票者",
          "type":"string",
          "mapping":"context.createdBy"
        },
        {
          "_systemId":countup.add(),
          "_id":"assignedTo",
          "_displayName":"担当者",
          "type":"string",
          "mapping":"context.assignedTo"
        },
      ],
      "taskDefs": [
        {
          "_systemId": countup.add(),
          "_id": "001",
          "type": "start"
        },
        {
          "_systemId": countup.add(),
          "_id": "002",
          "_displayName": "起票者決定待ち",
          "type": "wait",
          "isCompletedForWait": "(cp) => cp.context.createdBy",
          "fromIds": ["001"]
        },
        {
          "_systemId": countup.add(),
          "_id": "003",
          "_displayName": "担当者決定待ち",
          "type": "wait",
          "fromIds": ["001"],
          "isCompletedForWait": "(cp) => cp.context.assignedTo"
        },
        {
          "_systemId": countup.add(),
          "_id": "999",
          "type": "end",
          "fromIds": ["002", "003"]
        }
      ]
    }
  }]
]

export async function loadDevData(p: string) {
  console.log(p);
  var f = data.find(([d, _]) => {
    return p.indexOf(d.split("/").join(path.sep)) != -1
  })
  return f ? f[1]() : null;
}

const common = {
  _systemId: null,
  _id: null,
  _reratedId: null,
  _displayName: null,
  _description: null,
  _status: null,
  _createdAt: null,
  _updatedAt: null,
}