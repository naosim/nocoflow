import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fastifyStatic from '@fastify/static';
import { directoryExists, fileExists, readJsonFile, writeJsonFile } from './lib.ts';
import { config } from './config.ts';
class DomainType {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  static context = new DomainType("context");
  static payload = new DomainType("payload");
  static flow = new DomainType("flow");
  static flowdef = new DomainType("flowdef");
  static contextdef = new DomainType("contextdef");
  static payloaddef = new DomainType("payloaddef");
  static all = [DomainType.context, DomainType.payload, DomainType.flow, DomainType.flowdef, DomainType.contextdef, DomainType.payloaddef];
  static isValid(type: string): boolean {
    return DomainType.all.some((t) => t.value === type);
  }
}
// const domainTypes = ["context", "payload", "flow", "flowdef"];
// セットアップ
// ディレクトリがなかったら作成する
async function setup() {
  const rootPahth = path.join(__dirname, '../');
  const dirPath = path.join(rootPahth, config.dataPath);
  if(!await directoryExists(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
  DomainType.all.map(v => v.value).forEach(async (type) => {
    const contextDataPath = path.join(dirPath, `./${type}`);
    if(!await directoryExists(contextDataPath)) {
      await fs.mkdir(contextDataPath, { recursive: true });
    }
  })
}

setup();

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// データリスト取得
fastify.get('/data/:domainType', async function handler (request, reply) {
  const { domainType } = request.params as { domainType: string };
  if(!DomainType.isValid(domainType)) {
    throw new Error("Invalid domain type");
  }
  const rootPahth = path.join(__dirname, '../');
  const dataPath = path.join(rootPahth, config.dataPath);
  const p = path.join(dataPath, `./${domainType}/_list.json`);
  if(!await fileExists(p)) {// ファイルがなかったら作成する
    writeJsonFile(p, []);
  }
  return readJsonFile(p);
})

fastify.get('/data/:domainType/:id', async function handler (request, reply) {
  const { domainType, id } = request.params as { domainType: string, id: string };
  if(!DomainType.isValid(domainType)) {
    throw new Error("Invalid domain type");
  }
  const rootPahth = path.join(__dirname, '../');
  const dataPath = path.join(rootPahth, config.dataPath);
  const p = path.join(dataPath, `./${domainType}/${id.split(".json").join("")}.json`);
  //const p = path.join(__dirname, `../data/${domainType}/${id}.json`);
  return readJsonFile(p);
})

fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../' + config.publicPath),
    prefix: '/public/',
});

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}



function loadDevData(path: string) {
  console.log(path);
}