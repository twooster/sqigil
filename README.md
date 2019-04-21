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

### Quick Reference

The standard form for producing SQL strings is:

```javascript
import { sql } from 'sqigil'

// Bare value inclusion:

sql`SELECT * FROM users WHERE name = ${"O'Connor"}`
// Or:
sql`SELECT * FROM users WHERE name = ${sql.value("O'Connor")}`
// "SELECT * FROM users WHERE name = 'O''Connor'"

// Explicit conversion:

sql`SELECT * FROM users WHERE id IN (${sql.csv([1, 2, 3, 4])})`
// "SELECT * FROM users WHERE id IN (1, 2, 3, 4)"

sql`SELECT * FROM users WHERE active = ${sql.bool('yes')}`
// "SELECT * FROM users WHERE active = TRUE`

const user = { name: "John", active: false }
sql`INSERT INTO users(${sql.keys(user)}) VALUES (${sql.values(user)})`
// `INSERT INTO users("name", "active") VALUES ('John', FALSE)`

sql`SELECT * FROM ${sql.id('users')}`
// `SELECT * FROM "users"`

sql`SELECT ${sql.csids(['name', 'active'])} FROM users`
// `SELECT "name", "active" FROM users`

sql`SELECT * FROM (${sql.raw('SELECT * FROM users')})`
// `SELECT * FROM (SELECT * FROM users)`
```

### Conversion Operators

#### `sql.value` or just `<plain value>`

An escaped Postgres value, dependent on input type.

| Data Type | Conversion | JS Input | SQL Output |
|--|--|--|--|
| string | SQL string literal | `"It's nice!"` | `'It''s nice!'` |
| boolean | SQL boolean literal | `true` | `TRUE` |
| null | SQL NULL | `null` | `NULL` |
| undefined | SQL NULL | `undefined` | `NULL` |
| number | SQL number literal (escaped in some instances) | `10`, `1.2`, `Infinity`, `NaN` | `10`, `1.2`, `'+Infinity'`, `'NaN'` |
| array | SQL array, each element escaped | `[1, 'Green', [true, false]]` | `{1, 'Green', {TRUE, FALSE}}` |
| Date | SQL date in UTC | `new Date()` | `'2019-03-18T08:11:50.221+00:00'` |
| Buffer | Hex-encoded Postgres escape-string | `Buffer.from('abc')` | `E'\\x616263'` |
| object | JSON-encoded SQL string | `{ a: 1, b: "2" }` | `{"a":1,"b":"2"}` |
| Symbol | error | `Symbol('sym')` | Throws an error |



Additionally, objects can have a `toPostgres` (or `Symbol.for('ctf.toPostgres')`)
symbol defined on them, which -- if present and a function -- should return
the value that should be used instead. The value returned from this method
will be escaped as usual, **unless** `rawType` is defined on the object (or
`Symbol.for('ctf.rawType')`) and set to truthy. In that case, the value from
`toPostgres` is expected to be a `string`, and will treated as already
escaped and no processing will occur.


(This feature is built to roughly concur with the interface defined by
`pg-promise`.)


#### `sql.bool`

**Outputs:** Converts input value to a SQL boolean based upon Javascript
truthiness rules

```javascript
sql`SELECT ${sql.bool(null)}, ${sql.bool('')}, ${sql.bool('bob')}`
// SELECT FALSE, FALSE, TRUE
```

#### `sql.utc`, `sql.tz`

**Outputs:** A SQL date literal. Converts the provided date (must be a date) in
the timezone of the local machine (`sql.tz`) or in UTC (`sql.utc`):

```javascript
const date = new Date()
sql`SELECT ${sql.tz(date)}, ${sql.utc(date)}`
// SELECT '2019-03-18T08:11:50.221+02:00', '2019-03-18T08:09:50.221+00:00'
```

#### `sql.csv`

**Outputs:** Comma-separated SQL values, each escaped according to its type
(see `sql.value`):

```javascript
const userIds = [1, 2, 3]
sql`SELECT * FROM users WHERE id IN (${sql.csv(userIds)})`
// SELECT * FROM users WHERE id IN (1, 2, 3)
```

#### `sql.csids`

**Outputs:** Comma-separated list, with each value escaped as though it is a
SQL identifier:

```javascript
const cols = ['name', 'join_date']
sql`SELECT ${sql.csids(cols)} FROM users`
// SELECT "name", "join_date" FROM users`
```

#### `sql.id`

**Outputs:** A single SQL identifier name.  Also accepts arrays for
dot-separated names:

```javascript
const col = 'name'
const otherCol = ['interests', 'description']

sql`SELECT ${sql.id(col)}, ${sql.id(otherCol)} FROM users, interests`
// SELECT "name", "interests"."description" FROM users, interests
```

#### `sql.keys`, `sql.values`

**Outputs:**

A comma separated list of SQL identifiers (for `sql.keys`) or escaped values
(for `sql.values`), from the provided object:

```javascript
const user = { name: "John" }

sql`INSERT INTO users(${sql.keys(user)}) VALUES (${sql.values(user)})`
// INSERT INTO users("name") VALUES ('John')
```

#### `sql.raw`

The provided string (must be a string) with no escaping:

```javascript
const subQuery = `SELECT * FROM bands WHERE genre = "punk"`
sql`WITH punk_bands AS (${sql.raw(subQuery)}) SELECT * FROM punk_bands WHERE country2 = ${"US"}`
// WITH punk_bands AS (SELECT * FROM bands WHERE genre = "punk") SELECT * FROM punk_bands WHERE country2 = 'US'
```

## More Detailed Documentation

See the [documentation](https://tonywooster.com/sqigil) for a full list
of available formatting options. Of primary interest are the conversion
methods listed in [SqlSigil](https://tonywooster.com/sqigil/interfaces/sqlsigil.html).

## License

MIT, available [here](https://github.com/twooster/sqigil/blob/master/LICENSE).
