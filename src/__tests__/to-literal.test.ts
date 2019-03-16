import { dateToStringUTC } from '../date'
import { ToLiteralOpts, toLiteral } from '../to-literal'
import { toPostgres, rawType } from '../pg-convertible'

describe('toLiteral', () => {
  const opts: ToLiteralOpts = {
    convertDate: dateToStringUTC,
    convertObject: JSON.stringify
  }

  test('escapes strings', () => {
    expect(toLiteral(opts, 'bob')).toEqual(`'bob'`)
    expect(toLiteral(opts, `b'ob`)).toEqual(`'b''ob'`)
  })

  test('converts numbers', () => {
    expect(toLiteral(opts, 1.5)).toEqual('1.5')
    expect(toLiteral(opts, Infinity)).toEqual(`'+Infinity'`)
    expect(toLiteral(opts, -Infinity)).toEqual(`'-Infinity'`)
    expect(toLiteral(opts, NaN)).toEqual(`'NaN'`)
  })

  test('converts booleans', () => {
    expect(toLiteral(opts, true)).toEqual('TRUE')
    expect(toLiteral(opts, false)).toEqual('FALSE')
  })

  test('converts undefined to null', () => {
    expect(toLiteral(opts, undefined)).toEqual('NULL')
  })

  test('converts null to null', () => {
    expect(toLiteral(opts, null)).toEqual('NULL')
  })

  test('converts dates via the provided date conversion fn', () => {
    const opts = {
      convertDate: () => 'some-date',
      convertObject: JSON.stringify
    }
    expect(toLiteral(opts, new Date())).toEqual(`'some-date'`)
  })


  test('converts unknown objects via provided conversion fn', () => {
    const opts = {
      convertDate: dateToStringUTC,
      convertObject: () => 'some-obj'
    }
    expect(toLiteral(opts, {})).toEqual(`'some-obj'`)
  })

  it('converts buffers', () => {
    const b = Buffer.from('abc')
    expect(toLiteral(opts, b)).toEqual(`E'\\x616263'`)
  })

  it('throws on symbols', () => {
    expect(() => toLiteral(opts, () => Symbol())).toThrow()
  })

  it('throws on functions', () => {
    expect(() => toLiteral(opts, () => 'null')).toThrow()
  })

  describe('arrays', () => {
    test('converts empty arrays', () => {
      expect(toLiteral(opts, [])).toEqual('{}')
    })

    test('converts arrays with some values', () => {
      expect(toLiteral(opts, ['hi', 'there'])).toEqual(`{'hi', 'there'}`)
    })

    test('escapes array values', () => {
      expect(toLiteral(opts, [`h'i`, Infinity])).toEqual(`{'h''i', '+Infinity'}`)
    })

    test('supports nested arrays', () => {
      expect(toLiteral(opts, [['hi'], ['there']])).toEqual(`{{'hi'}, {'there'}}`)
    })

    test('throws on mutually recursive arrays', () => {
      const a: any[] = ['a']
      a.push(a)
      expect(() => toLiteral(opts, a)).toThrow()
    })
  })

  describe('types with to-postgres attributes', () => {
    describe('raw types', () => {
      it('throws if the result of toPostgres is not a string', () => {
        const tSymbol = {
          [toPostgres]: () => true,
          [rawType]: true
        }
        const tString = {
          toPostgres: () => true,
          rawType: true
        }
        expect(() => toLiteral(opts, tSymbol)).toThrow()
        expect(() => toLiteral(opts, tString)).toThrow()
      })

      it('passes thru raw values', () => {
        const tSymbol = {
          [toPostgres]: () => 'bob',
          [rawType]: true
        }
        const tString = {
          toPostgres: () => 'bob',
          rawType: true
        }
        expect(toLiteral(opts, tSymbol)).toEqual('bob')
        expect(toLiteral(opts, tString)).toEqual('bob')
      })
    })

    describe('non-raw values', () => {
      it('throws on recursive structures', () => {
        const tSymbol = {
          [toPostgres]: () => tString,
        }
        const tString = {
          toPostgres: () => tSymbol,
        }
        expect(() => toLiteral(opts, tSymbol)).toThrow()
        expect(() => toLiteral(opts, tString)).toThrow()
      })

      it('escapes the results', () => {
        const tSymbol = {
          [toPostgres]: () => 'bob',
        }
        const tString = {
          toPostgres: () => 'bob',
        }
        expect(toLiteral(opts, tSymbol)).toEqual(`'bob'`)
        expect(toLiteral(opts, tString)).toEqual(`'bob'`)
      })
    })
  })
})
