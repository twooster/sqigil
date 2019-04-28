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
