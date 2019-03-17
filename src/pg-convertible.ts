export const rawType: unique symbol = Symbol.for('ctf.rawType')
export const toPostgres: unique symbol = Symbol.for('ctf.toPostgres')

/**
 * An object conforming to the `pg-promise` custom postgres type
 * formatting interface.
 */
export interface PgConvertible {
  [toPostgres]: () => unknown
  [rawType]?: boolean
}

/**
 * An object conforming to the `pg-promise` custom postgres formatting
 * interface, where the output is raw, meaning it can be included
 * directly in SQL.
 */
export interface PgSafeString extends PgConvertible {
  [toPostgres]: () => string
  [rawType]: true
}

/**
 * Determines if a given value is PgConvertible like.
 * @param val the value to check
 * @returns true if the object is a pg-convertible object
 */
export function isPgConvertible(val: unknown): val is PgConvertible {
  return typeof val === 'object' && val !== null &&
    toPostgres in val &&
    typeof (val as any)[toPostgres] === 'function'
}

/**
 * Determines if a given value is PgSafeString like.
 * @param val the value to check
 * @returns true if the object is a pg-safestring object
 */
export function isPgSafeString(val: unknown): val is PgSafeString {
  return isPgConvertible(val) && val[rawType] === true
}

/**
 * Builds a PgSafeString object given an assumed-safe string.
 * The resulting object can also be `toString`d to return its
 * raw contents.
 *
 * @param val the string to wrap
 * @returns a PgSafeString object
 */
export function makeSafeString(val: string): PgSafeString & { toString: () => string } {
  return {
    [toPostgres]: () => val,
    [rawType]: true,
    toString: () => val
  }
}
