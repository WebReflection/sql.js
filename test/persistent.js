import Database from '../persistent.js';

const db = new Database('test.db');

db.run('CREATE TABLE IF NOT EXISTS hello (a int, b char)');

let stmt = db.prepare("SELECT COUNT(*) AS fields FROM hello WHERE a=$aval AND b=$bval");
let result = stmt.getAsObject({$aval: 1, $bval: 'world'});
if (!result.fields) {
  console.log('New DB');
  db.run(`INSERT INTO hello VALUES (0, 'hello')`);
  db.run(`INSERT INTO hello VALUES (1, 'world')`);
}

stmt = db.prepare("SELECT * FROM hello WHERE a=$aval AND b=$bval");
result = stmt.getAsObject({$aval: 1, $bval: 'world'});
console.log(result);

db.save();
db.close();
