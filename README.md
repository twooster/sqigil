# SQigiL: A Postgres SQL Sigil for JavaScript

This project is an easy-to-use SQL string sigil for Javascript. Right
now it's only designed to work with Postgres.

It lets you do things like this:

```javascript
import { sql as S } from 'sqigil'

const usersTbl = 'my_users'

function getUserById(pg, id) {
  const safeSql = S`SELECT * FROM ${S.name(usersTbl)} WHERE id = ${id}`
  return pg.query(safeSql)
}

function addUser(pg, user) {
  const safeSql = S`INSERT INTO users(${S.keys(user)}) VALUES (${S.values(user)})`
  return pg.query(safeSql)
}
```

## Motivation

I like sigil strings. I like safety.

## TODO

* Complete documentation
* More examples
* Tests

## License

MIT.
