/**
 * @typedef {"eval" | "forFilter" | "forMap" | "forReduce" | "if" | "milestone"} ProcessType
 */

/**
 * @typedef ProcessObject
 * @property {any} [input] 
 * @property {ProcessType} type 
 * @property {string} [process] 
 * @property {string} [referenceId] - The id to store the output of this process in the payload
 * @property {string} [id] - The id of the process, used for if-else branching
 * @property {string} [then] - The id of the next process to execute if the condition is true
 * @property {string} [else] - The id of the next process to execute if the condition is false
 */

/**
 * @typedef MilestoneProcessObject
 * @property {"milestone"} type 
 * @property {string} [referenceId] - The id to store the output of this process in the payload
 * @property {string} [id] - The id of the process, used for if-else branching

 */

/**
 * @typedef Payload
 * @property {any} _previousOutput 
 * @property {{input:any, output:any}[]} _processResults
 */



function jq(obj, path) {
  if (!obj || !path) {
    return obj;
  }
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined; // Path not found
    }
  }
  return current;
}

/**
 * 
 * @param {ProcessObject} [obj] 
 * @param {any} payload 
 * @returns 
 */
function replaceRetealValue(payload, obj) {
  if(!obj) {
    return obj;
  } else if(typeof obj === 'string') {
    if(obj.startsWith("@{") && obj.endsWith("}")) {
      const key = obj.replace("@{", "").replace("}", "");
      return jq(payload, key);
    } else {
      return obj;
    }
  } else if(obj instanceof Date) {
    return obj;
  } else if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = replaceRetealValue(payload, obj[key]);
    }
    return newObj;
  }
  return obj;
}


/**
 * 
 * @param {{input:any, processes:(ProcessObject)[]}} param0 
 * @returns 
 */
async function execute({input, processes}) {
  /** @type {Payload} */
  var payload = {};
  if(input && !Array.isArray(input)) {
    payload = input;
  }
  payload._previousOutput = input;
  if(!payload._processResults) {
    payload._processResults = [];
  }
  for(let i = 0; i < processes.length; i++) {
    
    const process = processes[i];
    const input = replaceRetealValue(payload, process.input);
    var output = null;
    if(process.type === "eval") {
      output = await evalProcess({input, payload, obj:process});
    } else if(process.type === "forFilter") {
      output = await forFilterProcess({input, payload, obj:process});
    } else if(process.type === "forMap") {
      output = await forMapProcess({input, payload, obj:process});
    } else if(process.type === "forReduce") {
      output = await forReduceProcess({input, payload, obj:process});
    } else if(process.type === "if") {
      output = payload._previousOutput;
      const nextId = await ifProcess({input, payload, obj:process});
      i = processes.map((v, i) => v.id == nextId ? i : -1).filter(v => v >= 0)[0] - 1;
    } else if(process.type === "milestone") {
      output = await milestoneProcess({payload});
    }

    if(process.referenceId) {
      payload[process.referenceId] = output;
    }
    payload._processResults.push({input, output, process})
    payload._previousOutput = output;

    console.log(payload);
  }
  
  return payload;
}

/**
 * 
 * @param {{input:any, payload:any, obj:ProcessObject}} param0 
 * @returns Promise<any>
 */
async function evalProcess({input, payload, obj}) {
  const isOneline = obj.process?.split('\n').length === 1;
  var impl = isOneline ? `return ${obj.process}` : obj.process;
  if(input) {
    var p = Function("input", "payload",...Object.keys(input), impl);
    return await p(input, payload, ...Object.values(input));
  } else {
    var p = Function("input", "payload", impl);
    return await p(input, payload);
  }
}

/**
 * 
 * @param {{input:any, payload:any, obj:ProcessObject}} param0 
 * @returns Promise<string> - processIdを返す
 */
async function ifProcess({input, payload, obj}) {
  return await evalProcess({input, payload, obj}) ? obj.then : obj.else;
}

/**
 * 
 * @param {{payload:any}} param0 
 * @returns Promise<any>
 */
async function milestoneProcess({payload}) {
  // Milestone process does not return anything
  return payload._previousOutput;
}

/**
 * 
 * @param {{input:any, payload:any, obj:ProcessObject}} param0 - input.itemsに配列を指定する。obj.process内ではitem, index, arrayを参照できる。
 * @returns Promise<any[]>
 */
async function forFilterProcess({input, payload, obj}) {
  const result = [];
  for(let index in input.items) {
    const item = input.items[index];
    const flag = await evalProcess({input: {item, index, array:input.items}, payload, obj});
    if(flag) {
      result.push(item);
    }
  }
  return result;
}

/**
 * 
 * @param {{input:any, payload:any, obj:ProcessObject}} param0 - input.itemsに配列を指定する。obj.process内ではitem, index, arrayを参照できる。
 * @returns Promise<any[]>
 */
async function forMapProcess({input, payload, obj}) {
  const result = [];
  for(let index in input.items) {
    const item = input.items[index];
    const newObj = await evalProcess({input: {item, index, array:input.items}, payload, obj});
    result.push(newObj);
  }
  return result;
}

/**
 * 
 * @param {{input:any, payload:any, obj:ProcessObject}} param0 - input.itemsに配列を指定する。input.initに初期値を指定する。 obj.process内ではresult, item, index, arrayを参照できる。
 * @returns Promise<any>
 */
async function forReduceProcess({input, payload, obj}) {
  var result = input.init !== undefined ? input.init : {};
  for(let index in input.items) {
    const item = input.items[index];
    result = await evalProcess({input: {item, index, array:input.items, result}, payload, obj});
  }
  return result;
}

// sample1 
await (async ()=>{
  const input = {
    value: 3
  }
  /** @type {ProcessObject[]} */
  const processes = [
    {
      input: {value: "@{value}"},
      type: "eval",
      process: "value + 2",
      referenceId: "v1"
    },
    {
      input: {value: "@{v1}"},// referenceIdを使う
      type: "eval",
      process: "value * 2",
      referenceId: "v2"
    },
    {
      input: {value: "@{v2}"},
      type: "if",
      process: "value > 8",
      then: "ID10",
      else: "ID20",
    },
    {
      id: "ID10",
      type: "eval",
      process: "payload._previousOutput + 10", // 前の出力結果はpayload._previousOutputにより取得可能
      referenceId: "v4"
    },
    {
      id: "ID20",
      type: "milestone",
      referenceId: "result"
    }
  ]

  const result = await execute({input, processes});
  console.log(result.result);
})();

await (async ()=>{
  const input = [1,2,3];
  /** @type {ProcessObject[]} */
  const processes = [
    {
      input: {items: "@{_previousOutput}"}, // forFilterは配列をitemsに入れる
      type: "forFilter",
      process: "item >= 2", // itemsの各要素はitemに入っている。他にもindex, arrayが使える。
    },
    {
      input: {items: "@{_previousOutput}"},
      type: "forMap",
      process: "item * 5",
    },
    {
      type: "milestone",
      referenceId: "result"
    }
  ];
  const result2 = await execute({input, processes: processes});
  console.log(result2.result);
})();

await (async ()=>{
  const input = [1,2,3];
  /** @type {ProcessObject[]} */
  const processes = [
    {
      input: {items: "@{_previousOutput}", init: 0},
      type: "forReduce",
      process: "result + item",
    },
    {
      type: "milestone",
      referenceId: "result"
    }
  ];
  const result2 = await execute({input, processes: processes});
  console.log(result2.result);
})();