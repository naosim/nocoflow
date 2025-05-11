export async function findAllFlowDef() {
  return await findAll('flowdef');
}

async function findAll(domainType) {
  const r = await fetch(`../../data/${domainType}`);
  const list = await r.json();
  const result = [];
  for(const item of list) {
    const r2 = await fetch(`../../data/${domainType}/${item.id}`);
    const flowDef = await r2.json();
    result.push(flowDef);
  }
  console.log(result);
  return result;
}

export async function getContextDef() {
  const r = await fetch(`../../data/contextdef/contextdef`);
  const result = await r.json();
  return result;
}