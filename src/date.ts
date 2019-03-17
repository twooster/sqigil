function pad2(num: number) {
  const str = num.toString()
  if (num < 10) {
    return "0" + str
  }
  return str
}

function pad3(num: number): string {
  const str = num.toString()
  if (num < 10) {
    return "00" + str
  }
  if (num < 100) {
    return "0" + str
  }
  return str
}

function pad4(num: number): string {
  const str = num.toString()
  if (num < 10) {
    return "000" + str
  }
  if (num < 100) {
    return "00" + str
  }
  if (num < 1000) {
    return "0" + str
  }
  return str
}

/**
 * Converts a date to a date string with timezone offset
 */
export function dateToString (date: Date): string {
  let offset = -date.getTimezoneOffset()
  let sign: string
  if (offset < 0) {
    sign = '-'
    offset = -offset
  } else {
    sign = '+'
  }

  return pad4(date.getFullYear()) + '-' +
    pad2(date.getMonth() + 1) + '-' +
    pad2(date.getDate()) + 'T' +
    pad2(date.getHours()) + ':' +
    pad2(date.getMinutes()) + ':' +
    pad2(date.getSeconds()) + '.' +
    pad3(date.getMilliseconds()) + sign +
    pad2(Math.floor(offset / 60)) + ':' +
    pad2(offset % 60)
}

/**
 * Converts a date to its UTC representation
 */
export function dateToStringUTC (date: Date): string {
  return pad4(date.getUTCFullYear()) + '-' +
    pad2(date.getUTCMonth() + 1) + '-' +
    pad2(date.getUTCDate()) + 'T' +
    pad2(date.getUTCHours()) + ':' +
    pad2(date.getUTCMinutes()) + ':' +
    pad2(date.getUTCSeconds()) + '.' +
    pad3(date.getUTCMilliseconds()) +
    "+00:00"
}
