export function mockDate(attrs: { year: number, month: number, day: number, hours: number, minutes: number, seconds: number, millis: number, tzOffset: number }): Date {
  const d = new Date()
  jest.spyOn(d, 'getFullYear').mockImplementation(() => attrs.year)
  jest.spyOn(d, 'getUTCFullYear').mockImplementation(() => attrs.year)
  jest.spyOn(d, 'getMonth').mockImplementation(() => attrs.month)
  jest.spyOn(d, 'getUTCMonth').mockImplementation(() => attrs.month)
  jest.spyOn(d, 'getDate').mockImplementation(() => attrs.day)
  jest.spyOn(d, 'getUTCDate').mockImplementation(() => attrs.day)
  jest.spyOn(d, 'getHours').mockImplementation(() => attrs.hours)
  jest.spyOn(d, 'getUTCHours').mockImplementation(() => attrs.hours)
  jest.spyOn(d, 'getMinutes').mockImplementation(() => attrs.minutes)
  jest.spyOn(d, 'getUTCMinutes').mockImplementation(() => attrs.minutes)
  jest.spyOn(d, 'getSeconds').mockImplementation(() => attrs.seconds)
  jest.spyOn(d, 'getUTCSeconds').mockImplementation(() => attrs.seconds)
  jest.spyOn(d, 'getMilliseconds').mockImplementation(() => attrs.millis)
  jest.spyOn(d, 'getUTCMilliseconds').mockImplementation(() => attrs.millis)
  jest.spyOn(d, 'getTimezoneOffset').mockImplementation(() => attrs.tzOffset)
  return d
}
