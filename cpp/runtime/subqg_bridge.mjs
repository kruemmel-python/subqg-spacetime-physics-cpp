import readline from 'node:readline';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

const developerRoot = path.resolve(process.argv[2] || '');
const modulesRoot = path.join(developerRoot, 'src', 'modules');
if (!fs.existsSync(modulesRoot)) {
  process.stdout.write(`${JSON.stringify({ id: 0, ok: false, error: `Invalid canonical developer root: ${developerRoot}` })}\n`);
  process.exit(2);
}

// Protocol output owns stdout. Module diagnostics are kept away from it.
console.log = (...args) => process.stderr.write(`${args.join(' ')}\n`);
console.warn = console.log;
console.error = console.log;

const instances = new Map();
const moduleCache = new Map();
let nextHandle = 1;

function safeName(value, kind) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_]+$/.test(value)) throw new Error(`Invalid ${kind}`);
  return value;
}

async function loadModule(name) {
  safeName(name, 'module name');
  if (moduleCache.has(name)) return moduleCache.get(name);
  const filename = name === 'index' ? path.join(developerRoot, 'src', 'index.mjs') : path.join(modulesRoot, `${name}.mjs`);
  if (!fs.existsSync(filename)) throw new Error(`Unknown canonical module: ${name}`);
  const loaded = await import(pathToFileURL(filename).href);
  moduleCache.set(name, loaded);
  return loaded;
}

function normalize(value, seen = new WeakSet()) {
  if (typeof value === 'number' && !Number.isFinite(value)) return { $number: String(value) };
  if (typeof value === 'bigint') return { $bigint: value.toString() };
  if (typeof value === 'function') return { $function: value.name || 'anonymous' };
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return { $circular: true };
  seen.add(value);
  if (value instanceof Map) return { $map: [...value.entries()].map(([k,v]) => [normalize(k, seen),normalize(v, seen)]) };
  if (value instanceof Set) return { $set: [...value].map(v => normalize(v, seen)) };
  if (ArrayBuffer.isView(value)) return Array.from(value, v => normalize(v, seen));
  if (Array.isArray(value)) return value.map(v => normalize(v, seen));
  const output = {};
  for (const [key,item] of Object.entries(value)) output[key] = normalize(item, seen);
  return output;
}

async function inventory() {
  const files = fs.readdirSync(modulesRoot).filter(f => f.endsWith('.mjs')).sort();
  const result = {};
  for (const file of files) {
    const name = file.slice(0, -4);
    const mod = await loadModule(name);
    result[name] = Object.keys(mod).sort();
  }
  return result;
}

async function dispatch(request) {
  const op = request.op;
  if (op === 'inventory') return inventory();
  if (op === 'invoke') {
    const mod = await loadModule(request.module);
    const member = mod[safeName(request.export, 'export name')];
    if (typeof member !== 'function') throw new Error(`Export is not callable: ${request.export}`);
    return await member(...(request.args ?? []));
  }
  if (op === 'construct') {
    const mod = await loadModule(request.module);
    const Type = mod[safeName(request.export, 'class name')];
    if (typeof Type !== 'function') throw new Error(`Export is not constructable: ${request.export}`);
    const handle = nextHandle++;
    instances.set(handle, new Type(...(request.args ?? [])));
    return { handle };
  }
  if (op === 'call') {
    const instance = instances.get(request.handle);
    if (!instance) throw new Error(`Unknown instance handle: ${request.handle}`);
    const method = instance[safeName(request.method, 'method name')];
    if (typeof method !== 'function') throw new Error(`Unknown instance method: ${request.method}`);
    return await method.apply(instance, request.args ?? []);
  }
  if (op === 'get') {
    const instance = instances.get(request.handle);
    if (!instance) throw new Error(`Unknown instance handle: ${request.handle}`);
    return instance[safeName(request.property, 'property name')];
  }
  if (op === 'destroy') return { destroyed: instances.delete(request.handle) };
  if (op === 'shutdown') { setImmediate(() => process.exit(0)); return { shutdown: true }; }
  throw new Error(`Unknown operation: ${op}`);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async line => {
  let request;
  try {
    request = JSON.parse(line);
    const value = await dispatch(request);
    process.stdout.write(`${JSON.stringify({ id: request.id, ok: true, value: normalize(value) })}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ id: request?.id ?? 0, ok: false, error: error?.stack || String(error) })}\n`);
  }
});
