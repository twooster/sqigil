import { makeSafeString, toPostgres, rawType } from '../pg-convertible'

describe('makeSafeString', () => {
  test('has a callable `toPostgres` symbol', () => {
    expect(makeSafeString('string')[toPostgres]()).toEqual('string')
  })

  test('rawType symbol is true', () => {
    expect(makeSafeString('string')[rawType]).toEqual(true)
  })

  test('toString returns the string', () => {
    expect(makeSafeString('string').toString()).toEqual('string')
  })

  test('wrapping in String returns its string', () => {
    expect(String(makeSafeString('string'))).toEqual('string')
  })
})
