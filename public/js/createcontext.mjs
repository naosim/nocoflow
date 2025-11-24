import { findAllFlowDef, getContextDef, getAllContext, getAllFlowDef } from "./repository.mjs";

const flowDefList = await getAllFlowDef();
var createFlowDef = flowDefList.filter(v => v.type == 'create')[0];
console.log(createFlowDef);
var formItems = createFlowDef.forms.map(v => {
  if(v.inputType == 'textarea') {
    return `<div id="${v._id}">${v._displayName}<textarea name="${v._id}"></textarea></div>`
  }
  return `<div id="${v._id}">${v._displayName}<input type="${v.text}" name="${v._id}" value="${v.value || ''}" /></div>`
});
console.log(formItems);
var html = `
<h1>新規作成</h1>
<form method="post" action="/action/flow/${createFlowDef._id}">
<input type="hidden" name="flowDefId" value="${createFlowDef._id}"></input>
${formItems.join('')}

</form>
<button id="submit">submit</button>
`
document.getElementById("app").innerHTML = html;
document.getElementById("submit").addEventListener('click', async () => {
  var form = document.getElementsByTagName("form")[0];
  var formData = new FormData(form);
  var data = {};
  console.log(formData);
  for (const [key, value] of formData.entries()) {
    data[key] = value.length > 0 ? value : null;
  }
  const res = await fetch(`/action/flow/${createFlowDef._id}`, {
    method:'post',
    body: JSON.stringify(data)
  })
  const flow = await res.json();
  console.log(data, flow);
  location.href = `./flow.html?flowId=${flow._id}`
})
