# SQigiL: A Postgres SQL template string for Javascript

[![CircleCI](https://circleci.com/gh/twooster/sqigil.svg?style=svg)](https://circleci.com/gh/twooster/sqigil)
[![Coverage Status](https://coveralls.io/repos/github/twooster/sqigil/badge.svg)](https://coveralls.io/github/twooster/sqigil)

This project provides an easy-to-use, safe, SQL string templating
solution. It's built to work with
[ES2015 template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

This project is built in Typescript, and will maintain 100% test
coverage.

Disclaimer: This project is still pretty new. I'm fairly confident in
its safety, but for now, you're a beta user.

## Installation

```sh
npm install --save sqigil
```

## Documentation

**Documentation is available [here](https://twooster.github.io/sqigil)**

Documentation is updated every version bump. A changelog is available
[here](https://github.com/twooster/sqigil/blob/master/CHANGELOG.md).

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
  return sql`INSERT INTO ${sql.id(usersTbl)}(${sql.keys(userObj)}) VALUES(${sql.values(userObj)})`;
}
// e.g., insertUserSql({ id: 123, name: "John Smith", age: 23 }) ===
//   `INSERT INTO "users"("id", "name", "age") VALUES(123, 'John Smith', 23)`
```

See the [documentation](https://twooster.github.io/sqigil) for a full list
of available formatting options. Of primary interest are the conversion
methods listed in [SqlSigil](file:///home/tony/projects/sqigil/docs/interfaces/sqlsigil.html).

Note that value-conversions are compatible with the interface defined
by `pg-promise`. That means there is full support for `toPostgres`/`rawType`
object properties (both strings and symbols).

## License

MIT, available [here](https://github.com/twooster/sqigil/blob/master/LICENSE).
