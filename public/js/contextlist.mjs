import { h, text, app } from "./hyperapp.mjs"
import { findAllFlowDef, getContextDef, getAllContext } from "./repository.mjs";

/** 
 * @typedef State 
 * @property {{_displayName}} contextDef,
 * @property {any[]} contextList,
 * @property {any[]} flowDefList,
 */

/**
 * 
 * @param {State} param0 
 * @returns 
 */
const view = ({contextDef, contextList, flowDefList}) => 
  h("main", {}, [
    h("h1", {}, text(`${contextDef._displayName}一覧`)),
    h("a", {href:"./createcontext.html?flowdefId=fd001.json"}, text("新規作成")),
    ...contextList.map(context => contextView({contextDef, context})),
  ]);
const contextView = ({contextDef, context}) => {
  return h("div",{},text(JSON.stringify(context)))
}
const updateContextDef = (state, contextDef) => ({...state, contextDef})
const updateContextList = (state, contextList) => ({...state, contextList})

var dispatch = app({
  init: {contextDef:{_displayName:""}, contextList:[], flowDefList:[]},
  view,
  node: document.getElementById("app"),
})

const contextDef = await getContextDef();
console.log(contextDef);
document.title = contextDef._displayName;
const columnNames = contextDef.columns.map((column) => column._displayName || column._id);
const keys = contextDef.columns.map((column) => column._id);
const contextList = await getAllContext();
console.log(contextList);
dispatch(updateContextDef, contextDef);
dispatch(updateContextList, contextList);