import { toPostgres, rawType } from './symbols'

export interface SafeString {
  [toPostgres]: () => string
  [rawType]: true
  toString: () => string
  valueOf: () => string
}

/**
 * Builds a SafeString object given an assumed-safe string.
 * The resulting object can also be `toString`d to return its
 * raw contents.
 *
 * @param val the string to wrap
 * @returns a SafeString object
 */
export function makeSafeString(val: string): SafeString {
  const fn = () => val
  return {
    [toPostgres]: fn,
    [rawType]: true,
    toString: fn,
    valueOf: fn
  }
}
