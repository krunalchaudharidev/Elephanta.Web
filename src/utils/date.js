export function formatToIST(iso) {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(d)
  } catch (e) {
    return '-'
  }
}

export function toDateTimeLocalIST(value) {
  if (!value) return ''
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(value))

    const lookup = {}
    for (const p of parts) lookup[p.type] = p.value

    const year = lookup.year || ''
    const month = lookup.month || ''
    const day = lookup.day || ''
    const hour = lookup.hour || '00'
    const minute = lookup.minute || '00'
    if (!year || !month || !day) return ''
    return `${year}-${month}-${day}T${hour}:${minute}`
  } catch (e) {
    return ''
  }
}

export function dateTimeLocalISTToUTC(value) {
  if (!value) return null
  try {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)
    if (!m) return null
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    const hour = Number(m[4])
    const minute = Number(m[5])
    const second = m[6] ? Number(m[6]) : 0
    const msUtcIfSameNumbers = Date.UTC(year, month - 1, day, hour, minute, second)
    const istOffsetMs = 5.5 * 60 * 60 * 1000 // Asia/Kolkata is UTC+5:30
    const utcTs = msUtcIfSameNumbers - istOffsetMs
    return new Date(utcTs).toISOString()
  } catch (e) {
    return null
  }
}
