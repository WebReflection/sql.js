import toJSONCallback from 'to-json-callback';
import database from './database.js';

const OPEN              = 'open';
const CREATE_FUNCTION   = 'create_function';
const EACH              = 'each';
const ERROR             = 'error';
const EXEC              = 'exec';
const GET_ROWS_MODIFIED = 'getRowsModified';
const RUN               = 'run';
const SAVE              = 'save';

let Class = null;

if ('onconnect' in self) {
  const bootstrap = database();

  const dbs = new Map;

  const message = ({ data, currentTarget: port }) => {
    const [id, action, name, ...rest] = data;
    const done = (action, ...rest) => port.postMessage([id, action, ...rest]);
    try {
      switch (action) {
        case OPEN: {
          if (dbs.has(name))
            done(action);
          else {
            bootstrap.then(Database => {
              dbs.set(name, [new Database(name, ...rest), Promise.resolve()]);
              done(action);
            });
          }
          break;
        }
        case CREATE_FUNCTION: {
          const [db] = dbs.get(name);
          rest[1] = Function(`'use strict';return(${rest[1]})`).call(void 0);
          db[action](...rest);
          done(action);
          break;
        }
        case EACH: {
          const [db] = dbs.get(name);
          const rows = [];
          rest.push(row => {
            rows.push(row);
          });
          db[action](...rest);
          done(action, rows);
          break;
        }
        case EXEC:
        case GET_ROWS_MODIFIED: {
          const [db] = dbs.get(name);
          done(action, db[action](...rest));
          break;
        }
        case RUN: {
          const [db] = dbs.get(name);
          db[action](...rest);
          done(action);
          break;
        }
        case SAVE: {
          const details = dbs.get(name);
          const [db, promise] = details;
          // enqueue saves from multiple tabs
          details[1] = promise.then(() => db[action]().then(() => {
            done(action);
          }));
          break;
        }
      }
    }
    catch ({ message }) {
      done(ERROR, message);
    }
  };

  self.onconnect = ({ ports }) => {
    for (const port of ports) {
      port.onmessage = message;
      port.postMessage(OPEN);
    }
  };
}
else {
  const withResolvers = () => Promise.withResolvers();

  const options = { type: 'module', name: 'sql.js' };

  const message = function ({ data }) {
    const [id, action, ...rest] = data;
    const [resolve, reject] = this.get(id);
    this.delete(id);
    if (action === ERROR) reject(...rest);
    else resolve(...rest);
  };

  Class = class Database {
    #port;
    #promise;
    #id = 0;
    #name = '';
    #promises = new Map;
    #postMessage(action, ...rest) {
      if (!this.#port) throw new Error('the db is already closed');
      const { promise, resolve, reject } = withResolvers();
      const id = this.#id++;
      this.#promise = promise;
      this.#promises.set(id, [resolve, reject]);
      this.#port.postMessage([id, action, this.#name, ...rest]);
      return promise;
    }
    constructor(name, ...rest) {
      const { promise, resolve, reject } = withResolvers();
      const sw = new SharedWorker(import.meta.url, options);
      sw.onerror = console.error;
      const { port } = sw;
      this.#port = port;
      this.#name = name;
      this.#promise = promise.then(() => {
        port.onmessage = message.bind(this.#promises);
        return this.#postMessage(OPEN, ...rest);
      });
      port.onmessage = ({ data }) => {
        if (data === OPEN) resolve();
        else reject();
      };
      port.start();
    }
    async close() {
      await this.#promise;
      this.#port.close();
      this.#port = null;
      this.#name = '';
      this.#promise = null;
    }
    async create_function(name, callback) {
      await this.#promise;
      await this.#postMessage(CREATE_FUNCTION, name, toJSONCallback(callback));
      return this;
    }
    async each(sql, params, callback, done) {
      await this.#promise;
      for (const row of await this.#postMessage(EACH, sql, params || null))
        await callback(row);
      if (done) await done();
      return this;
    }
    async exec(sql, ...rest) {
      await this.#promise;
      return this.#postMessage(EXEC, sql, ...rest);
    }
    async getRowsModified() {
      await this.#promise;
      return this.#postMessage(GET_ROWS_MODIFIED);
    }
    async run(sql, ...rest) {
      await this.#promise;
      await this.#postMessage(RUN, sql, ...rest);
      return this;
    }
    async save() {
      await this.#promise;
      await this.#postMessage(SAVE);
      return this;
    }
  }
}

export default Class;
