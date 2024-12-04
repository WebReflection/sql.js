import Database from '../shared.js';

const db = new Database('shared.db');

await db.run('CREATE TABLE IF NOT EXISTS hello (a int, b char)');

await db.each('SELECT COUNT(*) AS fields FROM hello', null, async row => {
  if (!row.fields) {
    await db.run(`INSERT INTO hello VALUES (0, 'hello')`);
    await db.run(`INSERT INTO hello VALUES (1, 'world')`);
  }
});

await db.each('SELECT * FROM hello', null, console.log);

await db.create_function("addOne", x => x + 1);

await db.each("SELECT addOne(1) AS value", null, console.log);

await db.save();

await db.close();

console.log('OK');
