/**
 * Pad a positive number with up to one leading zero
 * @hidden
 */
function pad2(num: number): string {
  const str = num.toString()
  if (num < 10) {
    return '0' + str
  }
  return str
}

/**
 * Pad a positive number with up to two leading zeroes
 * @hidden
 */
function pad3(num: number): string {
  const str = num.toString()
  if (num < 10) {
    return '00' + str
  }
  if (num < 100) {
    return '0' + str
  }
  return str
}

/**
 * Pad a positive number with up to three leading zeroes
 * @hidden
 */
function pad4(num: number): string {
  const str = num.toString()
  if (num < 10) {
    return '000' + str
  }
  if (num < 100) {
    return '00' + str
  }
  if (num < 1000) {
    return '0' + str
  }
  return str
}

/**
 * Converts a Date object to a Postgres-compatible date string in the local
 * timezone. The resulting string is not wrapped or escaped.
 *
 * @param date the date to convert
 * @returns Postgres-compatible date string
 */
export function dateToString(date: Date): string {
  let offset = -date.getTimezoneOffset()
  let sign: string
  if (offset < 0) {
    sign = '-'
    offset = -offset
  } else {
    sign = '+'
  }

  let year = date.getFullYear()
  const bcYear = year < 1
  if (bcYear) {
    year = -year + 1 // No 0 years -- 2 BC, 1 BC, 1 AD, etc
  }

  return pad4(year) + '-'
    + pad2(date.getMonth() + 1) + '-'
    + pad2(date.getDate()) + 'T'
    + pad2(date.getHours()) + ':'
    + pad2(date.getMinutes()) + ':'
    + pad2(date.getSeconds()) + '.'
    + pad3(date.getMilliseconds()) + sign
    + pad2(Math.floor(offset / 60)) + ':'
    + pad2(offset % 60)
    + (bcYear ? ' BC' : '')
}

/**
 * Converts a Date object to a Postgres-compatible date string in the UTC
 * timezone. The resulting string is not wrapped or escaped.
 *
 * @param date the date to convert
 * @returns Postgres-compatible date string in UTC timezone
 */
export function dateToStringUTC(date: Date): string {
  let year = date.getUTCFullYear()
  const bcYear = year < 1
  if (bcYear) {
    year = -year + 1 // No 0 years -- 2 BC, 1 BC, 1 AD, etc
  }

  return pad4(year) + '-'
    + pad2(date.getUTCMonth() + 1) + '-'
    + pad2(date.getUTCDate()) + 'T'
    + pad2(date.getUTCHours()) + ':'
    + pad2(date.getUTCMinutes()) + ':'
    + pad2(date.getUTCSeconds()) + '.'
    + pad3(date.getUTCMilliseconds())
    + '+00:00'
    + (bcYear ? ' BC' : '')
}
