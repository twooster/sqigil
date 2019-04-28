import { mockDate } from '../__mocks__/date'
import { dateToString, dateToStringUTC } from '../date'

test('date strings', () => {
  const d1 = mockDate({
    year: 2019,
    month: 0,
    day: 22,
    hours: 14,
    minutes: 23,
    seconds: 45,
    millis: 221,
    tzOffset: 120
  })

  expect(dateToString(d1)).toEqual('2019-01-22T14:23:45.221-02:00')
  expect(dateToStringUTC(d1)).toEqual('2019-01-22T14:23:45.221+00:00')

  const d2 = mockDate({
    year: 200,
    month: 0,
    day: 1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    millis: 0,
    tzOffset: -90
  })

  expect(dateToString(d2)).toEqual('0200-01-01T00:00:00.000+01:30')
  expect(dateToStringUTC(d2)).toEqual('0200-01-01T00:00:00.000+00:00')

  const d3 = mockDate({
    year: 20,
    month: 9,
    day: 11,
    hours: 12,
    minutes: 13,
    seconds: 14,
    millis: 15,
    tzOffset: 0
  })

  expect(dateToString(d3)).toEqual('0020-10-11T12:13:14.015+00:00')
  expect(dateToString(d3)).toEqual('0020-10-11T12:13:14.015+00:00')

  const d4 = mockDate({
    year: 2,
    month: 9,
    day: 11,
    hours: 12,
    minutes: 13,
    seconds: 14,
    millis: 15,
    tzOffset: 0
  })

  expect(dateToString(d4)).toEqual('0002-10-11T12:13:14.015+00:00')
  expect(dateToString(d4)).toEqual('0002-10-11T12:13:14.015+00:00')
})

test('bc years', () => {
  const d1 = mockDate({
    year: 0,
    month: 0,
    day: 22,
    hours: 14,
    minutes: 23,
    seconds: 45,
    millis: 221,
    tzOffset: 120
  })

  expect(dateToString(d1)).toEqual('0001-01-22T14:23:45.221-02:00 BC')
  expect(dateToStringUTC(d1)).toEqual('0001-01-22T14:23:45.221+00:00 BC')

  const d2 = mockDate({
    year: -199,
    month: 0,
    day: 22,
    hours: 14,
    minutes: 23,
    seconds: 45,
    millis: 221,
    tzOffset: 120
  })

  expect(dateToString(d2)).toEqual('0200-01-22T14:23:45.221-02:00 BC')
  expect(dateToStringUTC(d2)).toEqual('0200-01-22T14:23:45.221+00:00 BC')
})
