export function cleanRut(input: string): string {
  return (input || '')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/[^0-9K]/g, '')
}

function computeDV(num: string): string {
  let sum = 0
  let multiplier = 2
  for (let i = num.length - 1; i >= 0; i--) {
    sum += parseInt(num[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const mod = 11 - (sum % 11)
  if (mod === 11) return '0'
  if (mod === 10) return 'K'
  return String(mod)
}

export function validateRut(input: string): boolean {
  const clean = cleanRut(input)
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  return computeDV(body) === dv
}

export function formatRut(input: string): string {
  const clean = cleanRut(input)
  if (clean.length === 0) return ''
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  // Add thousands separators to body
  const reversed = body.split('').reverse()
  const chunks: string[] = []
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3).reverse().join(''))
  }
  const withDots = chunks.reverse().join('.')
  return `${withDots}-${dv}`
}

export function normalizeRut(input: string): string {
  // Return canonical NN...N-DV (no dots, dash present, uppercase DV)
  const clean = cleanRut(input)
  if (clean.length < 2) return clean
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`
}

/**
 * Format RUT and cap its clean length (digits + DV) to a maximum, default 9.
 * This ensures the final formatted string never exceeds "99.999.999-9" (12 chars).
 */
export function formatRutCapped(input: string, maxCleanLen = 9): string {
  const clean = cleanRut(input).slice(0, maxCleanLen)
  // If nothing or 1 char, let user keep typing without forcing dash
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean
  return formatRut(clean)
}
