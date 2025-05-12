import { findAllFlowDef, getContextDef, getAllContext } from "./repository.mjs";

const contextDef = await getContextDef();
console.log(contextDef);
document.title = contextDef._displayName;
const columnNames = contextDef.columns.map((column) => column._displayName || column._id);
const keys = contextDef.columns.map((column) => column._id);
var contextList = await getAllContext();
console.log(contextList);

var html = `
<h1>${contextDef._displayName}</h1>
`
document.getElementById("app").innerHTML = html;

const grid = new gridjs.Grid({
  columns: columnNames,
  data: contextList.map((c) => keys.map((key) => c[key]))
});
grid.render(document.getElementById("wrapper"));