/**
 * pg-promise compatible symbol for converting values to Postgres.
 * If an object has this attribute, the results of this function will
 * be be taken to be the object's database representation.
 */
export const toPostgres: unique symbol = Symbol.for('ctf.toPostgres')
/**
 * pg-promise compatible symbol for indicating that the results of
 * a `toPostgres` method should be interpreted as raw/safe.
 */
export const rawType: unique symbol = Symbol.for('ctf.rawType')

/**
 * An object conforming to the `pg-promise` custom postgres type
 * formatting interface.
 *
 * @property `Symbol.for('ctf.toPostgres')` Method that returns a value. If the
 *   [[rawType]] attribute of this object is true, the results of this method
 *   should be a string. Otherwise, the results will be further escaped
 *   in any template string.
 *
 * @property `Symbol.for('ctf.rawType')` Optional, indicating whether the value
 *   of [[toPostgres]] is a raw SQL string or not.
 */
export interface PgConvertible {
  /** @hidden */
  [toPostgres]: () => unknown
  [rawType]?: boolean
}

/**
 * A [[PgConvertible]] instance that returns a raw string. That means
 * the `Symbol.flor('ctf.rawType')` attribute must return `true`.
 */
export interface PgSafeString extends PgConvertible {
  /** @hidden */
  [toPostgres]: () => string
  [rawType]: true
}

/**
 * Determines if a given value is PgConvertible like.
 * @param val the value to check
 * @returns true if the object is a pg-convertible object
 * @hidden
 */
export function isPgConvertible(val: unknown): val is PgConvertible {
  return typeof val === 'object' && val !== null &&
    toPostgres in val &&
    typeof (val as any)[toPostgres] === 'function'
}

/**
 * Determines if a given value is PgSafeString like.
 *
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
