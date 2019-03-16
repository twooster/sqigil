import { ConversionError } from './errors'
import { rawType, toPostgres, isPgConvertible } from './pg-convertible'

export interface ToLiteralOpts {
  convertDate: (date: Date) => unknown
  convertObject: (obj: object) => unknown
}

/**
 * Escapes a string to its postgres-safe equivalent
 */
function escapeString(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'"
}

/**
 * Converts an array of values into its postgres literal
 * representation
 */
function arrayToLiteral(opts: ToLiteralOpts, arr: unknown[], seen: Set<unknown>): string {
  const literals = arr.map(val => toLiteralRecur(opts, val, seen))
  return '{' + literals.join(', ') + '}'
}

function toLiteralRecur(opts: ToLiteralOpts, val: unknown, seen?: Set<unknown>): string {
  switch (typeof val) {
    case 'string':
      return escapeString(val)
    case 'number':
      // Logic from pg-promise
      if (Number.isFinite(val)) {
        return val.toString()
      } else if (val === Number.POSITIVE_INFINITY) {
        return "'+Infinity'"
      } else if (val === Number.NEGATIVE_INFINITY) {
        return "'-Infinity'"
      } else {
        return "'NaN'"
      }
    case 'boolean':
      return val ? "TRUE" : "FALSE"
    case 'undefined':
      return "NULL"
    case 'object':
      if (val === null) {
        return "NULL"
      } else if (val instanceof Date) {
        return toLiteralRecur(opts, opts.convertDate(val), seen)
      } else if (val instanceof Buffer) {
        return "E'\\x" + val.toString('hex')  + "'"
      } else {
        if (!seen) {
          seen = new Set()
        } else if (seen.has(val)) {
          throw new ConversionError('Cyclical data')
        }
        seen.add(val)
        if (isPgConvertible(val)) {
          const pgVal = val[toPostgres]()
          if (val[rawType]) {
            if (typeof pgVal !== 'string') {
              throw new ConversionError('Expected string from raw value')
            }
            return pgVal
          }
          return toLiteralRecur(opts, pgVal, seen)
        } else if (typeof (val as any)['toPostgres'] === 'function') {
          // Support non-symbol toPostgres objects
          const pgVal = (val as any)['toPostgres']();
          if ((val as any)['rawType']) {
            if (typeof pgVal !== 'string') {
              throw new ConversionError('Expected string from raw value')
            }
            return pgVal
          }
          return toLiteralRecur(opts, pgVal, seen)
        } else if (Array.isArray(val)) {
          return arrayToLiteral(opts, val, seen)
        } else {
          return toLiteralRecur(opts, opts.convertObject(val as object), seen)
        }
      }
    default:
      throw new ConversionError('Unhandled type: ' + (typeof val))
  }
}

export function toLiteral(opts: ToLiteralOpts, val: unknown): string {
  return toLiteralRecur(opts, val)
}
