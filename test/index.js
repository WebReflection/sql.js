import initSqlJs from '../index.js';

const SQL = await initSqlJs();

const db = new SQL.Database();

db.run(`
CREATE TABLE hello (a int, b char);
INSERT INTO hello VALUES (0, 'hello');
INSERT INTO hello VALUES (1, 'world');
`); // Run the query without returning anything

// Prepare an sql statement
const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

// Bind values to the parameters and fetch the results of the query
const result = stmt.getAsObject({':aval' : 1, ':bval' : 'world'});
console.log(result); // Will print {a:1, b:'world'}

db.close();
