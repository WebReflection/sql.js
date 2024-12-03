import IDBMapSync from '@webreflection/idb-map/sync';
import initSqlJs from './index.js';

const idbMap = new IDBMapSync('sql.js');
const [SQL,] = await Promise.all([
  initSqlJs(),
  idbMap.sync(),
]);

export default class Database extends SQL.Database {
  #name;
  constructor(name, ...rest) {
    // prefer already stored db over initial data
    if (name && idbMap.has(name))
      rest = [idbMap.get(name)];
    // sanitize possible buffers if not Uin8Array
    else if (rest.length && !(rest[0] instanceof Uint8Array))
      rest[0] = new Uint8Array(rest[0]);
    super(...rest);
    this.#name = name;
  }
  delete() {
    idbMap.delete(this.#name);
    return idbMap.sync();
  }
  save() {
    idbMap.set(this.#name, this.export());
    return idbMap.sync();
  }
}