'use client'

/**
 * Generates a deterministic SHA-256 hash in hex format for the provided password.
 * Runs entirely on the client using the Web Crypto API.
 */
export async function hashPassword(password: string) {
  const normalized = (password ?? '').normalize('NFKC')
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('El navegador no soporta WebCrypto para proteger la contraseña.')
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  return hex
}

