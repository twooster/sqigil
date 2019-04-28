import { ConversionError } from './errors'
import { rawType, toPostgres, isPgConvertible } from './pg-convertible'

interface DateConversionFn {
  /**
   * A function to be called to convert dates to their SQL equivalent.
   * If this function returns a normal value, that value will be
   * escaped according to usual rules. Meaning, e.g., that you can
   * return a string, and that string will be appropriately escaped.
   *
   * However, if you return an object with `toPostgres` and `rawType`
   * attributes, those attributes will be respected in the usual way.
   *
   * @param date the date to convert
   */
  (date: Date): unknown
}

interface ObjectConversionFn {
  /**
   * A function to be called to convert dates to their SQL equivalent.
   * If this function returns a normal value, that value will be
   * escaped according to usual rules. Meaning, e.g., that you can
   * return a string, and that string will be appropriately escaped.
   *
   * However, if you return an object with `toPostgres` and `rawType`
   * attributes, those attributes will be respected in the usual way.
   *
   * @param obj the object to convert to sql
   */
  (obj: object): unknown
}

/**
 * Options to use when converting certain values to their SQL-safe
 * equivalents.
 */
export interface ToLiteralOpts {
  /**
   * A function to be called to convert dates to their SQL equivalent.
   *
   * @param convertDate the date conversion function
   */
  convertDate: DateConversionFn
  /**
   * A function to be called to convert objects to their SQL equivalent.
   *
   * @param convertObject the object conversion function
   */
  convertObject: ObjectConversionFn
}

/**
 * Escapes and wraps a string to its postgres-safe equivalent
 * @hidden
 */
function escapeString(value: string, inArray: boolean): string {
  if (inArray) {
    return `"` + value.replace(/"/g, `\\"`) + '"'
  }
  return `'` + value.replace(/'/g, `''`) + `'`
}

/**
 * Converts an array of values into its postgres literal
 * representation
 * @hidden
 */
function arrayToLiteral(opts: ToLiteralOpts, arr: unknown[], inArray: boolean, seen: Set<unknown>): string {
  const val =  '{' + arr.map(val => toLiteralRecur(opts, val, true, seen)).join(', ') + '}'
  if (!inArray) {
    return escapeString(val, false)
  }
  return val
}

/**
 * @hidden
 */
function toLiteralRecur(opts: ToLiteralOpts, val: unknown, inArray: boolean, seen?: Set<unknown>): string {
  switch (typeof val) {
    case 'string':
      return escapeString(val, inArray)

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
        return toLiteralRecur(opts, opts.convertDate(val), inArray, seen)
      } else if (val instanceof Buffer) {
        return `E'\\x` + val.toString('hex')  + `'`
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
          return toLiteralRecur(opts, pgVal, inArray, seen)
        } else if (typeof (val as any)['toPostgres'] === 'function') {
          // Support non-symbol toPostgres objects
          const pgVal = (val as any)['toPostgres']();
          if ((val as any)['rawType']) {
            if (typeof pgVal !== 'string') {
              throw new ConversionError('Expected string from raw value')
            }
            return pgVal
          }
          return toLiteralRecur(opts, pgVal, inArray, seen)
        } else if (Array.isArray(val)) {
          return arrayToLiteral(opts, val, inArray, seen)
        } else {
          return toLiteralRecur(opts, opts.convertObject(val as object), inArray, seen)
        }
      }

    default:
      throw new ConversionError('Unhandled type: ' + (typeof val))
  }
}

/**
 * Converts a given value to its Postgres literal representation, given
 * the provided options.
 *
 * @param opts the conversion options
 * @param val the value to convert
 * @returns the given value converted to a sql-safe string
 */
export function toLiteral(opts: ToLiteralOpts, val: unknown): string {
  return toLiteralRecur(opts, val, false)
}
