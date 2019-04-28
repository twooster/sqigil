import { toPostgres, rawType } from './symbols'

/**
 * A [[PgConvertible]] instance that returns a raw string. That means
 * the `Symbol.for('ctf.rawType')` attribute must return `true`.
 */
export interface PgSafeString {
  /** @hidden */
  [toPostgres]: () => string
  [rawType]: true
  toString: () => string
  valueOf: () => string
}

/**
 * Builds a PgSafeString object given an assumed-safe string.
 * The resulting object can also be `toString`d to return its
 * raw contents.
 *
 * @param val the string to wrap
 * @returns a PgSafeString object
 */
export function makeSafeString(val: string): PgSafeString {
  const fn = () => val
  return {
    [toPostgres]: fn,
    [rawType]: true,
    toString: fn,
    valueOf: fn
  }
}
