import { ConversionError } from './errors'
import { toPostgres, PgSafeString, isPgSafeString, makeSafeString } from './pg-convertible'
import { toLiteral, ToLiteralOpts } from './to-literal'
import { dateToString, dateToStringUTC } from './date'

/**
 * Options for creating a new sql template-string sigil.
 */
export type SigilOpts = ToLiteralOpts

/**
 * SQL templating string method. Has attached methods for other
 * interpolations rather than just escaped values.
 */
export interface SqlSigil {
  /**
   * Template string interface. All templated values will be converted
   * according to the rules of [[value]] by default. Use the other
   * formatting methods attached to this object (e.g., [[csv]], [[bool]],
   * [[id]], etc) to achieve different formatting.
   *
   * Example:
   *
   * ```
   * sql`SELECT * FROM ${sql.id('users')} WHERE name = ${"Escaped '' Name"} AND expires_at < ${new Date()}`
   * // Becomes
   * // `SELECT * FROM "users" WHERE name = 'Escaped '''' Name' AND expires_at < '2019-03-17T14:52:04.221+00:00'`
   * ```
   */
  (strings: TemplateStringsArray, ...args: unknown[]): string

  /**
   * Converts any given object into its SQL Boolean equivalent.
   *
   * Example:
   *
   * ```
   * sql`SELECT ${sql.bool(true)}, ${sql.bool(null)}`
   * // Becomes
   * // `SELECT TRUE, FALSE`
   * ```
   *
   * @param val the value to convert to boolean, according to Javascript
   *   boolean semantics
   */
  bool(val: unknown): PgSafeString

  /**
   * Converts an array of objects into a comma-separated list of
   * SQL-safe values. See [[value]] for conversion information.
   *
   * @param vals array of values to convert
   */
  csv(vals: unknown[]): PgSafeString

  /**
   * Converts an array of strings (or multi-part string ids as arrays)
   * into a list of comma-separated SQL-safe ids. See [[id]].
   *
   * Example:
   *
   * ```
   * sql`SELECT ${sql.csids('id', ['tbl2', 'id'])} FROM tbl, tbl2`
   * // Becomes
   * // `SELECT "id", "tbl2"."id" FROM tbl, tbl2`
   * ```
   *
   * @param ids array of ids (strings or string arrays) to covert
   */
  csids(ids: Array<string | string[]>): PgSafeString

  /**
   * Converts a string into an SQL-safe identifier. If passed multiple
   * parameters, this method will instead build a period-delimited identifier.
   *
   * Example:
   *
   * ```
   * sql`SELECT ${sql.id('id')}, ${sql.id('tbl2', 'name')} FROM tbl, tbl2`
   * // Becomes
   * // SELECT "id", "tbl2"."name" FROM tbl, tbl2
   * ```
   *
   * @param first first id component
   * @param rest remainder of id components
   */
  id(first: string, ...rest: string[]): PgSafeString

  /**
   * Given a plain javascript object, returns a list of that object's
   * keys formatted as SQL ids. See [[id]] for details.
   *
   * Example:
   *
   * ```
   * sql`INSERT INTO users(${sql.keys({ name: "joe", age: 23 })) ...`
   * // Becomes
   * // `INSERT INTO users("name", "age") ...`
   * ```
   *
   * @param object the object whose keys will be iterated
   */
  keys(obj: object): PgSafeString

  /**
   * Includes the provided string as raw, unescaped SQL.
   *
   * Example:
   *
   * ```
   * const subQ = sql`SELECT * FROM users`
   * sql`SELECT * FROM (${sql.raw(subQ)})`
   * // Becomes
   * // SELECT * FROM (SELECT * FROM users)
   * ```
   *
   * @param val the raw sql to include
   */
  raw(sql: string): PgSafeString

  /**
   * Converts a date into a Postgres-formatted date string in the local
   * timezone.
   *
   * @param date the date to convert
   */
  tz(date: Date): PgSafeString

  /**
   * Converts a date into a Postgres-formatted date string in the UTC
   * timezone.
   *
   * @param date the date to convert
   */
  utc(date: Date): PgSafeString

  /**
   * Converts a value into its Postgres-escaped equivalent. This is also
   * the default behavior for any values included in a given query string.
   *
   * Example:
   *
   * ```
   * sql`SELECT * FROM users WHERE name = ${sql.value("James")}`
   * // Becomes
   * // SELECT * FROM users WHERE name = 'James'
   * ```
   *
   * Boolean values will be converted to TRUE/FALSE.
   * Undefined objects will be converted to NULL.
   * Null values will be converted to NULL.
   * Numbers will be converted to their Postgres equivalents, including
   *   +Infinity, -Infinity, and NaN.
   * Arrays will be converted to Postgres array literals, with value
   *   conversions applied to each array element.
   * Buffers will be converted to a hex-encoded
   *   [Postgres escape string](https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS-ESCAPE),
   * Date objects will be converted to a Postgres-compatible date string
   *   according to the [[SigilOpts]] `convertDate` option provided to build
   *   the sql sigil (defaults to [[dateToStringUTC]]).
   * Objects will be converted given the following rules:
   *   * If the object has a `toPostgres` function, that function will be
   *     called. If the object also has a `rawType` attribute set to true,
   *     then the results of the `toPostgres` call will be included as
   *     a raw string. Otherwise, the results of that call will be
   *     processed as any other normal value
   *   * The above also applies if the object has the
   *     `Symbol.for('ctf.toPostgres')` and `Symbol.for('ctf.rawType')`
   *     attributes defined.
   *   * Otherwise, the object will be converted via the [[SigilOpts]]
   *     `convertObject` attribute used to build the SQL sigil. Defaults to
   *     `JSON.stringify`
   *
   * @param val the value to convert
   */
  value(val: unknown): PgSafeString

  /**
   * Takes the values of the provided object and coverts them to their
   * Postgres-value equivalents. Object values will be converted according
   * to the rules of [[value]].
   *
   * Example:
   *
   * ```
   * sql`INSERT INTO users(name, age) VALUES(${sql.values({ name: "John", age: 23 }))
   * // Becomes
   * // INSERT INTO users(name, age) VALUES('John', 23)
   */
  values(obj: object): PgSafeString
}

/**
 * Escapes a string as though it were a Postgres name/id.
 * @hidden
 */
function escapeId(ref: string): string {
  return '"' + ref.replace(/"/g, '""') + '"'
}

/**
 * Builds a sigil/templating object given the provided options
 *
 * @param opts the sigil options
 * @returns a template-string function with associated helpers
 *   on it
 */
export function makeSigil(opts: SigilOpts): SqlSigil {
  function sigil(strings: TemplateStringsArray, ...args: unknown[]): string {
    let i
    let str = ''
    for (i = 0; i < args.length; ++i) {
      str += strings[i]

      const arg = args[i]
      // Shortcut a happy path:
      if (isPgSafeString(arg)) {
        str += arg[toPostgres]()
      } else {
        str += toLiteral(opts, arg)
      }
    }
    str += strings[i]
    return str
  }

  sigil.raw = function raw(value: string): PgSafeString {
    return makeSafeString(value)
  }

  sigil.id = function id(first: string, ...rest: string[]): PgSafeString {
    let str = escapeId(first)
    for (let i = 0; i < rest.length; ++i) {
      str += '.' + escapeId(rest[i])
    }
    return makeSafeString(str)
  }

  sigil.utc = function utc(val: Date): PgSafeString {
    return makeSafeString("'" + dateToStringUTC(val) + "'")
  }

  sigil.tz = function tz(val: Date): PgSafeString {
    return makeSafeString("'" + dateToString(val) + "'")
  }

  sigil.keys = function keys(val: object): PgSafeString {
    return makeSafeString(
      Object.keys(val).map(escapeId).join(', ')
    )
  }

  sigil.values = function values(val: object): PgSafeString {
    return makeSafeString(
      Object.keys(val).map(k => toLiteral(opts, (val as any)[k])).join(', ')
    )
  }

  sigil.bool = function bool(val: unknown): PgSafeString {
    return makeSafeString(val ? "TRUE" : "FALSE")
  }

  sigil.csv = function csv(vals: unknown[]): PgSafeString {
    return makeSafeString(vals.map(v => toLiteral(opts, v)).join(', '))
  }

  sigil.csids = function csids(ids: Array<string | string[]>): PgSafeString {
    return makeSafeString(ids.map(v => {
      if (typeof v === 'string') {
        return escapeId(v)
      } else {
        if (v.length === 0) {
          throw new ConversionError('Cannot convert empty id')
        } else {
          return v.map(v => escapeId(v)).join('.')
        }
      }
    }).join(', '))
  }

  sigil.value = function value(val: unknown): PgSafeString {
    return makeSafeString(toLiteral(opts, val))
  }

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
  convertObject: JSON.stringify
})
