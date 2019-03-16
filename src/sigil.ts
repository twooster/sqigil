import { toPostgres, PgSafeString, isPgSafeString, makeSafeString } from './pg-convertible'
import { toLiteral, ToLiteralOpts } from './to-literal'
import { dateToString, dateToStringUTC } from './date'

export type SigilOpts = ToLiteralOpts

export interface SqlSigil {
  (strings: TemplateStringsArray, ...args: unknown[]): string
  bool(val: unknown): PgSafeString
  csv(vals: unknown[]): PgSafeString
  id(...names: string[]): PgSafeString
  keys(val: object): PgSafeString
  raw(val: string): PgSafeString
  tz(val: Date): PgSafeString
  utc(val: Date): PgSafeString
  value(val: unknown): PgSafeString
  values(val: object): PgSafeString
}

function escapeId(ref: string): string {
  return '"' + ref.replace(/"/g, '""') + '"'
}

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
        str += makeSafeString(toLiteral(opts, arg))
      }
    }
    str += strings[i]
    return str
  }

  sigil.raw = function raw(value: string): PgSafeString {
    return makeSafeString(value)
  }


  sigil.id = function id(first: string, ...rest: string[]): PgSafeString {
    if (rest.length === 0) {
      if (first === '*') {
        return makeSafeString('*')
      } else {
        return makeSafeString(escapeId(first))
      }
    }
    let str = first
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

  sigil.value = function value(val: unknown): PgSafeString {
    return makeSafeString(toLiteral(opts, val))
  }
  return sigil
}

export const sql: SqlSigil = makeSigil({
  dateToString: dateToStringUTC,
  objToString: JSON.stringify
})
