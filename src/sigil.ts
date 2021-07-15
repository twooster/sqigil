import { ConversionError } from './errors'
import { SafeString, makeSafeString } from './safe-string'
import { dateToString, dateToStringUTC } from './date'
import { toLiteral, ConversionOpts } from './to-literal'

/**
 * SQL templating function, with methods for specific conversions.
 */
export interface SqlSigil {
  /**
   * Template string interface. All templated values will be converted
   * according to the rules of [[value]] by default. Use the other
   * formatting methods attached to this object (e.g., [[csv]], [[bool]],
   * [[id]], etc) to achieve different output conversions.
   *
   * ```javascript
   * sql`SELECT * FROM ${sql.id('users')} WHERE name = ${"Escaped '' Name"} AND expires_at < ${new Date()}`
   * // `SELECT * FROM "users" WHERE name = 'Escaped '''' Name' AND expires_at < '2019-03-17T14:52:04.221+00:00'`
   * ```
   */
  (strings: TemplateStringsArray, ...args: unknown[]): string

  /**
   * Converts any given object into its SQL Boolean equivalent.
   *
   * ```javascript
   * sql`SELECT ${sql.bool(true)}, ${sql.bool(null)}`
   * // `SELECT TRUE, FALSE`
   * ```
   *
   * @param val the value to convert to boolean, according to Javascript
   *   boolean semantics
   */
  bool(val: unknown): SafeString

  /**
   * Converts an array of objects into a comma-separated list of
   * SQL-safe values. See [[value]] for conversion information.
   *
   * ```javascript
   * sql`SELECT ${sql.csv([0, 1, 2])}`
   * // `SELECT 0, 1, 2`
   * ```
   *
   * @param vals array of values to convert
   */
  csv(vals: unknown[]): SafeString

  /**
   * Converts an array of strings (or multi-part string ids as arrays)
   * into a list of comma-separated SQL-safe ids. See [[id]].
   *
   * ```javascript
   * sql`SELECT ${sql.csids('id', ['tbl2', 'id'])} FROM tbl, tbl2`
   * // `SELECT "id", "tbl2"."id" FROM tbl, tbl2`
   * ```
   *
   * @param ids array of ids (strings or string arrays) to covert
   */
  csids(ids: Array<string | string[]>): SafeString

  /**
   * @hidden
   */
  id(atoms: []): never
  /**
   * Converts an array of strings to a period-delimited SQL identifier.
   *
   * ```javascript
   * sql`SELECT ${sql.id(['users', 'name'])} FROM users`
   * // `SELECT "users"."name" FROM users`
   *
   * @param atoms the identifier "pieces"
   */
  id(atoms: string[]): SafeString

  /**
   * Converts a string into an SQL-safe identifier. If passed multiple
   * parameters, this method will instead build a period-delimited identifier.
   *
   * ```javascript
   * sql`SELECT ${sql.id('id')}, ${sql.id('tbl2', 'name')} FROM tbl, tbl2`
   * // `SELECT "id", "tbl2"."name" FROM tbl, tbl2`
   * ```
   *
   * @param first first id component
   * @param rest remainder of id components
   */
  id(first: string, ...rest: string[]): SafeString

  /**
   * Given a plain javascript object, returns a list of that object's
   * keys formatted as SQL ids. See [[id]] for details.
   *
   * ```javascript
   * sql`INSERT INTO users(${sql.keys({ name: "joe", age: 23 })) ...`
   * // `INSERT INTO users("name", "age") ...`
   * ```
   *
   * @param object the object whose keys will be iterated
   */
  keys(obj: { [k: string]: unknown }): SafeString

  /**
   * Includes the provided string as raw, unescaped SQL.
   *
   * ```javascript
   * const subQ = sql`SELECT * FROM users`
   * sql`SELECT COUNT(*) FROM (${sql.raw(subQ)})`
   * // SELECT COUNT(*) FROM (SELECT * FROM users)
   * ```
   *
   * @param val the raw sql to include
   */
  raw(sql: string): SafeString

  /**
   * Converts a date into a Postgres-formatted date string in the local
   * timezone.
   *
   * ```javascript
   * sql`SELECT ${sql.tz(new Date())}`
   * // `SELECT '2019-03-18T06:11:50.221+02:00'`
   * ```
   *
   * @param date the date to convert
   */
  tz(date: Date): SafeString

  /**
   * Converts a date into a Postgres-formatted date string in the UTC
   * timezone.
   *
   * ```javascript
   * sql`SELECT ${sql.tz(new Date())}`
   * // `SELECT '2019-03-18T08:11:50.221+00:00'`
   * ```
   *
   * @param date the date to convert
   */
  utc(date: Date): SafeString

  /**
   * Converts a value into its Postgres-escaped equivalent.
   *
   * ```javascript
   * sql`SELECT * FROM users WHERE name = ${sql.value("James")}`
   * // `SELECT * FROM users WHERE name = 'James'`
   * ```
   *
   * Note that this is exactly equivalent to including the value
   * directly:
   *
   * ```javascript
   * sql`SELECT * FROM users WHERE name = ${"James"}`
   * ```
   *
   * Both will result in the same output. The `value` method is
   * included only for explicitness, if desired. Conversion
   * rules are as follows:
   *
   * * Strings will be escaped.
   *
   *   ```javascript
   *   sql`SELECT ${"Jim's Crab Shack"}`
   *   // `SELECT 'Jim''s Crab Shack'`
   *   ```
   *
   * * Boolean values will be converted to TRUE/FALSE.
   *
   *   ```javascript
   *   sql`SELECT ${true}, ${false}`
   *   // `SELECT TRUE, FALSE`
   *   ```
   *
   * * Undefined objects will be converted to NULL.
   *
   *   ```javascript
   *   sql`SELECT ${undefined}`
   *   // `SELECT NULL`
   *   ```
   *
   * * Null values will be converted to NULL.
   *
   *   ```javascript
   *   sql`SELECT ${null}`
   *   // `SELECT NULL`
   *   ```
   *
   * * Numbers will be converted to their Postgres equivalents, including
   *   +Infinity, -Infinity, and NaN.
   *
   *   ```javascript
   *   sql`SELECT ${10}, ${1.2}, ${Infinity}, ${0/0}`
   *   // `SELECT 10, 1.2, '+Infinity', 'NaN'`
   *   ```
   *
   * * Arrays will be converted to string-formatted Postgres array literals,
   *   with value conversions applied to each array element. The string form
   *   is used because an empty SQL array (`ARRAY[]`) without a specific
   *   type is not allowed by Postgres.
   *
   *   ```javascript
   *   sql`SELECT ${[0, "X", new Date()]}`
   *   // `SELECT '{0, "X", "2019-03-18T08:11:50.221+00:00"}'`
   *   ```
   *
   * * Buffers will be converted to a hex-encoded
   *   [Postgres escape string](https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS-ESCAPE),
   *
   *   ```javascript
   *   sql`SELECT ${Buffer.from('abc')}`
   *   // `SELECT E'\\x616263'`
   *   ```
   *
   * * Date objects will be converted to a Postgres-compatible date string
   *   according to the [[ConversionOpts]] `convertDate` option provided to
   *   build the sql sigil (defaults to [[dateToStringUTC]]).
   *
   *   ```javascript
   *   sql`SELECT ${new Date()}`
   *   // `SELECT '2019-03-18T08:11:50.221+00:00'`
   *   ```
   *
   * * Objects will be converted given the following rules:
   *   * If the object has a `toPostgres` function, that function will be
   *     called. If the object also has a `rawType` attribute set to true,
   *     then the results of the `toPostgres` call will be included as
   *     a raw string. Otherwise, the results of that call will be
   *     processed as any other normal value
   *
   *     ```javascript
   *     const cooked = { toPostgres: () => "str" }
   *     sql`SELECT ${cooked}`
   *     // `SELECT 'str'`
   *
   *     const raw = { toPostgres: () => "str", rawType: true }
   *     sql`SELECT ${raw}`
   *     // `SELECT str`
   *     ```
   *
   *     The above also applies if the object has the
   *     `Symbol.for('ctf.toPostgres')` and `Symbol.for('ctf.rawType')`
   *     attributes defined. (See [[toPostgres]] and [[rawType]], which
   *     are importable symbols.)
   *
   *     ```javascript
   *     const raw = { [toPostgres]: () => "str", [rawType]: true }
   *     sql`SELECT ${raw}`
   *     // `SELECT str`
   *     ```
   *
   *   * Otherwise, the object will be converted via the [[ConversionOpts]]
   *     `convertObject` attribute used to build the SQL sigil. Defaults to
   *     `JSON.stringify`
   *
   *     ```javascript
   *     sql`SELECT ${{ name: "John's Chili Stop" }}`
   *     // `SELECT '{"name": "John''s Chili Stop"}'`
   *     ```
   *
   * @param val the value to convert
   */
  value(val: unknown): SafeString

  /**
   * Takes the values of the provided object and coverts them to their
   * Postgres-value equivalents. Object values will be converted according
   * to the rules of [[value]].
   *
   * Example:
   *
   * ```javascript
   * sql`INSERT INTO users(name, age) VALUES(${sql.values({ name: "John", age: 23 }))
   * // `INSERT INTO users(name, age) VALUES('John', 23)`
   * ```
   *
   */
  values(obj: { [k: string]: unknown }): SafeString
}

/**
 * Escapes and wraps a string as though it were a Postgres name/id.
 * @hidden
 */
function escapeId(ref: string): string {
  return '"' + ref.replace(/"/g, '""') + '"'
}

function raw(value: string): SafeString {
  return makeSafeString(value)
}

function id(arr: []): never
function id(arr: string[]): SafeString
function id(first: string, ...rest: string[]): SafeString
function id(first: string | string[], ...rest: string[]): SafeString {
  if (typeof first === 'string') {
    let str = escapeId(first)
    for (let i = 0; i < rest.length; ++i) {
      str += '.' + escapeId(rest[i])
    }
    return makeSafeString(str)
  } else {
    if (first.length === 0) {
      throw new ConversionError('Cannot convert empty id')
    } else {
      let str = escapeId(first[0])
      for (let i = 1; i < first.length; ++i) {
        str += '.' + escapeId(first[i])
      }
      return makeSafeString(str)
    }
  }
}

function utc(val: Date): SafeString {
  return makeSafeString("'" + dateToStringUTC(val) + "'")
}

function tz(val: Date): SafeString {
  return makeSafeString("'" + dateToString(val) + "'")
}

function keys(val: { [k: string]: unknown }): SafeString {
  return makeSafeString(
    Object.keys(val).map(escapeId).join(', ')
  )
}

function values(opts: ConversionOpts, val: { [k: string]: unknown }): SafeString {
  return makeSafeString(
    Object.keys(val).map(k => toLiteral(opts, val[k])).join(', ')
  )
}

function bool(val: unknown): SafeString {
  return makeSafeString(val ? 'TRUE' : 'FALSE')
}

function csv(opts: ConversionOpts, vals: unknown[]): SafeString {
  return makeSafeString(vals.map(v => toLiteral(opts, v)).join(', '))
}

function csids(ids: Array<string | string[]>): SafeString {
  return makeSafeString(ids.map(v => {
    if (typeof v === 'string') {
      return escapeId(v)
    } else { // Array
      if (v.length === 0) {
        throw new ConversionError('Cannot convert empty id')
      } else {
        return v.map(v => escapeId(v)).join('.')
      }
    }
  }).join(', '))
}

function value(opts: ConversionOpts, val: unknown): SafeString {
  return makeSafeString(toLiteral(opts, val))
}

function templateSql(
  opts: ConversionOpts,
  strings: TemplateStringsArray,
  args: unknown[],
): string {
  let i
  let str = ''
  for (i = 0; i < args.length; ++i) {
    str += strings[i]
    str += toLiteral(opts, args[i])
  }
  str += strings[i]
  return str
}

/**
 * Builds a sigil/templating object given the provided options
 *
 * @param opts the sigil options
 * @returns a template-string sigil function
 */
export function makeSigil(opts: ConversionOpts): SqlSigil {
  function sigil(strings: TemplateStringsArray, ...args: unknown[]): string {
    return templateSql(opts, strings, args)
  }

  sigil.raw = raw
  sigil.id = id
  sigil.utc = utc
  sigil.tz = tz
  sigil.keys = keys
  sigil.values = (val: { [k: string]: unknown }) => values(opts, val)
  sigil.bool = bool
  sigil.csv = (vals: unknown[]) => csv(opts, vals)
  sigil.csids = csids
  sigil.value = (val: unknown) => value(opts, val)

  return sigil
}

/**
 * The default SQL template string sigil.
 *
 * * Converts dates to UTC format
 * * Converts objects to JSON
 * * Converts all other values according to usual rules
 *
 * See [[SqlSigil]] for more documentation.
 */
export const sql: SqlSigil = makeSigil({
  convertDate: dateToStringUTC,
  convertObject: JSON.stringify,
})
