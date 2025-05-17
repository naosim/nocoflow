import { h, text, app } from "https://unpkg.com/hyperapp"
import {getContextDef} from "./repository.mjs"
const contextDef = await getContextDef();

var myapp = app({
  init: {contextDef, todos: [], value: ""},
  view: ({ contextDef, todos, value }) =>
    h("main", {}, [
      h("h1", {}, text(contextDef._displayName)),
      h("a", {href:"./contextlist.html"}, text(`${contextDef._displayName}一覧`)),
    ]),
  node: document.getElementById("app"),
})

