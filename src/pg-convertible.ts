export const rawType: unique symbol = Symbol.for('ctf.rawType')
export const toPostgres: unique symbol = Symbol.for('ctf.toPostgres')

export interface PgConvertible {
  [toPostgres]: () => unknown
  [rawType]?: boolean
}

export interface PgSafeString extends PgConvertible {
  [toPostgres]: () => string
  [rawType]: true
}

export function isPgConvertible(val: unknown): val is PgConvertible {
  return typeof val === 'object' && val !== null &&
    toPostgres in val &&
    typeof (val as any)[toPostgres] === 'function'
}

export function isPgSafeString(val: unknown): val is PgSafeString {
  return isPgConvertible(val) && val[rawType] === true
}

export function makeSafeString(val: string): PgSafeString {
  return {
    [toPostgres]: () => val,
    [rawType]: true
  }
}
