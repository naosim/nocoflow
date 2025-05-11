import { findAllFlowDef, getContextDef } from "./repository.mjs";

const contextDef = await getContextDef();
console.log(contextDef);
document.title = contextDef.displayName;
const columnNames = contextDef.columns.map((column) => column.displayName || column.id);
var html = `
<h1>${contextDef.displayName}</h1>
${columnNames.join(",")}
`
document.getElementById("app").innerHTML = html;

