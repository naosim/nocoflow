import { h, text, app } from "./hyperapp.mjs"
import {getContextDef} from "./repository.mjs"

const topPage = ({title}) => 
  h("main", {}, [
    h("h1", {}, text(title)),
    h("a", {href:"./contextlist.html"}, text(`${title}一覧`)),
  ]);
const updateTitle = (state, title) => ({...state, title})

var dispatch = app({
  init: {title:""},
  view: topPage,
  node: document.getElementById("app"),
})

dispatch(updateTitle, (await getContextDef())._displayName);

