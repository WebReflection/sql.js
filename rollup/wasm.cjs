const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const sql = require('sql.js');

const wasm = readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));
const index = join(__dirname, '..', 'esm', 'index.js');

writeFileSync(
  join(__dirname, '..', 'esm', 'sql.js'),
  `let initSqlJsPromise,module;\nexport default ${sql}`
);

writeFileSync(
  index,
  readFileSync(index).toString().replace(
    /function sqlite\(\) \{[\S\s]+?return buffer;\s+\}/,
    sqlite.toString().replace('$', wasm.toString('base64')),
  )
);

// ugly but way faster than Uint8Array.from(str, c => c.carCodeAt(0))
function sqlite() {
  const str = atob('$');
  const view = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++)
    view[i] = str[i].charCodeAt(0);
  return view;
}
