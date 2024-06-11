const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const sql = require('sql.js');
const { encode } = require('buffer-to-base64/encode');

const wasm = readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));
const sqlite = join(__dirname, '..', 'esm', 'base64', 'sqlite.js');

writeFileSync(
  join(__dirname, '..', 'esm', 'sql.js'),
  `let initSqlJsPromise,module;\nexport default ${sql}`
);

encode(wasm).then(base64 => writeFileSync(
  sqlite,
  `// ⚠️ AUTOMATICALLY GENERATED\nexport default '${base64}';`
));
