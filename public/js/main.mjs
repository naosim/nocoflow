import { ContextAndPlayLoad, FlowDefRepository, TaskType } from "./flowdef.mjs";
import { Flow } from "./flow.mjs";
import {flowDefsJson} from "./myflowdef.mjs";
function hash(str) {
  var hash = 0,
    i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Flow definition
/** @type {Flow} */
var flow;
function main() {  
  const flowDefRepository = FlowDefRepository.createFromJsonObject(flowDefsJson);
  const flowDef = flowDefRepository.findById("fd_mo");
  // フローを開始する
  flow = new Flow({
    id: "flow_001",
    cp: new ContextAndPlayLoad({payload: {data: "test", coffeeBeanGrindComplete: false}, context: {user: "hoge"}}),
    flowDef: flowDef,
  });
  flow.init().run();

  window.flow = flow;
}

var mermaidText = '';
function initFlowView() {
  updateFlowView().then(() => {});
}

window.onClickForceComplete = function(taskDefId) {
  var task = flow.taskStore.findByTaskDefId(taskDefId);
  task.forceComplete();
}

/**
 * 
 * @param {Flow} flow 
 */
function createMermaidText(flow) {
  var mermaidText = 'graph TD;\n';
  flow.tasks.forEach(task => {
    var completeButton = !task.taskDef.type.eq(TaskType.MANUAL) ? "" : `<br><button data-task-def-id="${task.taskDefId}" data-button-type="complete">完了</button>`;
    mermaidText += `${task.taskDefId}["${task.name} <button id="${task.taskDefId}" data-task-def-id="${task.taskDefId}" data-button-type="menu">▼</button>${completeButton}"]:::${task.state.value.value}\n`;
  });
  flow.tasks.forEach(task => {
    task.taskDef.fromIds.forEach(fromId => {
      mermaidText += fromId + ' --> ' + task.taskDefId + '\n';
    });
  });
  mermaidText += 'classDef pending fill:#fff;\n';
  mermaidText += 'classDef completed fill:#9fb;\n';

  // flow.tasks.forEach(task => {
  //   mermaidText += `click ${task.taskDefId} callback "Tooltip for a callback"\n`;
  // });


  return mermaidText;
}

async function updateFlowView() {
  var currentMermaidText = createMermaidText(flow);
  if(mermaidText != currentMermaidText) {
    mermaidText = currentMermaidText;
    const { svg } = await mermaid.render('graphDiv', mermaidText);
    const mermaidDiv = document.getElementById("mermaid");
    mermaidDiv.innerHTML = svg;
    mermaidDiv.querySelectorAll("button").forEach(button => {
      button.onclick = () => {
        const taskId = button.getAttribute("data-task-def-id");
        const buttonType = button.getAttribute("data-button-type");
        var task = flow.taskStore.findByTaskDefId(taskId);
        if(buttonType == "menu") {
          let dialog2 = xdialog.create({title: task.taskDef.name, body: `<button onclick="onClickForceComplete('${task.taskDef.id}')">完了にする</button>`});
          dialog2.show();
        } else if(buttonType == "complete") {
          task.forceComplete();
        }
      };
    });
  }
}




main();
setInterval(updateFlowView, 1000);
const mermaid = window.mermaid || {};
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', });
initFlowView();