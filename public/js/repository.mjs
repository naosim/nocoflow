export async function findAllFlowDef() {
  return await findAll('flowdef');
}

async function findAll(domainType) {
  const r = await fetch(`../../data/${domainType}/_list.json`);
  const list = await r.json();
  const result = [];
  for(const item of list) {
    const r2 = await fetch(`../../data/${domainType}/${item._systemId}.json`);
    const flowDef = await r2.json();
    result.push(flowDef);
  }
  console.log(result);
  return result;
}

export async function getContextDef() {
  const r = await fetch(`../../data/contextdef/contextdef.json`);
  const result = await r.json();
  return result;
}

export async function getAllContext() {
  return await findAll('context');
}

export async function getAllFlowDef() {
  return await findAll('flowdef');
}

export async function findFlow(flowId) {
  const r = await fetch(`../../data/flow/${flowId}.json`);
  const result = await r.json();
  return result;
}

export async function findFlowDef(flowDefId) {
  const r = await fetch(`../../data/flowdef/${flowDefId}.json`);
  const result = await r.json();
  return result;
}

export async function findContext(contextId) {
  const r = await fetch(`../../data/context/${contextId}.json`);
  const result = await r.json();
  return result;
}