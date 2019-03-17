# SQigiL: A Postgres SQL template string

[![CircleCI](https://circleci.com/gh/twooster/sqigil.svg?style=svg)](https://circleci.com/gh/twooster/sqigil)

This project provides an easy-to-use, safe, SQL string templating
solution. It's built to work with
[ES2015 template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

This project is built in Typescript, and will maintain 100% test
coverage.

## Installation

```sh
npm install --save sqigil
```

## Motivation

Projects such as [pg-promise](https://github.com/vitaly-t/pg-promise) provide
SQL templating functionality, but incur overhead actually performing
string parsing. With the advent of ES2015, it's simple to provide safe
and fast string templating. This project is an attempt to implement such
a solution.

## Usage

Examples:

```javascript
import { sql } from 'sqigil'

const usersTbl = 'users'

function getUserByIdSql(id) {
  return sql`SELECT * FROM ${sql.id(usersTbl)} WHERE id = ${id}`;
}
// e.g., getUserByIdSql(123) ===
//  'SELECT * FROM "users" WHERE id = 123'

function getUserByNameSql(name) {
  return sql`SELECT * FROM ${sql.id(usersTbl)} WHERE name= ${name}`;
}
// e.g., getUserByNameSql("john'; DROP TABLE users") ===
//  `SELECT * FROM "users" WHERE name = 'john''; DROP TABLE users'`

function insertUserSql(userObj) {
  return sql`INSERT INTO ${sql.id(usersTbl)}(${sql.keys(userObj)}) VALUES(${sql.values(userObj})`;
}
// e.g., insertUserSql({ id: 123, name: "John Smith", age: 23 }) ===
//   `INSERT INTO "users"("id", "name", "age") VALUES(123, 'John Smith', 23)`
```

## License

MIT, available [here](https://github.com/twooster/sqigil/blob/master/LICENSE).
