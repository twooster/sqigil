import { sql } from '../sigil'

describe('default sigil', () => {
  test('with no interpolation', () => {
    expect(sql`SELECT`).toEqual('SELECT')
  })

  test('basic value inclusion', () => {
    expect(sql`SELECT ${1}, ${"str"}, ${[1,2,3]}`)
      .toEqual(`SELECT 1, 'str', {1, 2, 3}`)
  })

  test('bool', () => {
    expect(sql`SELECT ${sql.bool(123)}, ${sql.bool(false)}`)
      .toEqual('SELECT TRUE, FALSE')
  })

  test('id', () => {
    expect(sql`${sql.id('tbl')} ${sql.id('tbl', 'col')}`)
      .toEqual('"tbl" "tbl"."col"')
  })

  test.todo('utc')
  test.todo('tz')

  test('keys', () => {
    const o = { a: 1, b: 2 }
    expect(sql`${sql.keys(o)}`)
      .toEqual('"a", "b"')
  })

  test('values', () => {
    const o = { a: 1, b: 'str' }
    expect(sql`${sql.values(o)}`)
      .toEqual(`1, 'str'`)
  })

  test('raw', () => {
    expect(sql`${sql.raw('no escape')}`)
      .toEqual(`no escape`)
  })

  test('csv', () => {
    expect(sql`${sql.csv([1, 'test', true])}`)
      .toEqual(`1, 'test', TRUE`)
  })

  test('csids', () => {
    expect(sql`${sql.csids(['tbl', ['tbl', 'col']])}`)
      .toEqual(`"tbl", "tbl"."col"`)
    expect(() => sql`${sql.csids(['tbl', []])}`).toThrow()
  })
})

describe('makeSigil', () => {
  test.todo('uses convertDate and convertObject')
})
