import { mockDate } from '../__mocks__/date'
import { sql, makeSigil } from '../sigil'

describe('default sigil', () => {
  test('with no interpolation', () => {
    expect(sql`SELECT`).toEqual('SELECT')
  })

  test('basic value inclusion', () => {
    expect(sql`SELECT ${1}, ${"str"}, ${[1,`He said, "I can't!"`,3]}`)
      .toEqual(`SELECT 1, 'str', '{1, "He said, \\"I can''t!\\"", 3}'`)
  })

  test('bool', () => {
    expect(sql`SELECT ${sql.bool(123)}, ${sql.bool(false)}`)
      .toEqual('SELECT TRUE, FALSE')
  })

  test('id', () => {
    expect(sql`${sql.id('tbl')} ${sql.id('tbl', 'col')}`)
      .toEqual('"tbl" "tbl"."col"')

    expect(sql`${sql.id(['tbl'])} ${sql.id(['tbl', 'col'])}`)
      .toEqual('"tbl" "tbl"."col"')

    // @ts-ignore
    expect(() => sql`${sql.id([])}`).toThrow()
  })

  test('utc', () => {
    const d = mockDate({
      year: 2019,
      month: 0,
      day: 22,
      hours: 14,
      minutes: 23,
      seconds: 45,
      millis: 221,
      tzOffset: 120
    })

    expect(sql`${sql.utc(d)}`).toEqual(`'2019-01-22T14:23:45.221+00:00'`)
  })

  test('tz', () => {
    const d = mockDate({
      year: 2019,
      month: 0,
      day: 22,
      hours: 14,
      minutes: 23,
      seconds: 45,
      millis: 221,
      tzOffset: 120
    })

    expect(sql`${sql.tz(d)}`).toEqual(`'2019-01-22T14:23:45.221-02:00'`)
  })

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

    // @ts-ignore
    expect(() => sql`${sql.csids(['tbl', []])}`).toThrow()
  })

  test('value', () => {
    expect(sql`${sql.value('string')}`)
      .toEqual(`'string'`)
  })

  test('inclusion in raw template strings', () => {
    expect(`${sql.value("O'Connor")}`).toEqual(`'O''Connor'`)
  })
})

describe('makeSigil', () => {
  test('uses convertDate and convertObject', () => {
    const custom = makeSigil({
      convertDate: () => 'date!',
      convertObject: () => 'object!'
    })

    expect(custom`${new Date()}`).toEqual(`'date!'`)
    expect(custom`${{ a: 1 }}`).toEqual(`'object!'`)
  })
})
