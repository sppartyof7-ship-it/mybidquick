// ============================================================================
// Shared encryption utilities for integration tokens
// Uses AES-256-GCM — authenticated encryption (tamper-proof)
// Env: INTEGRATION_ENCRYPTION_KEY (64-char hex = 32 bytes)
// ============================================================================
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12  // GCM standard
const TAG_LENGTH = 16 // GCM auth tag

function getKey() {
  const hex = process.env.INTEGRATION_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string → base64 string (iv:ciphertext:tag)
 */
export function encrypt(plaintext) {
  if (!plaintext) return null
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const tag = cipher.getAuthTag()
  // Format: base64(iv):base64(ciphertext):base64(tag)
  return `${iv.toString('base64')}:${encrypted}:${tag.toString('base64')}`
}

/**
 * Decrypt a stored string → plaintext
 */
export function decrypt(stored) {
  if (!stored) return null
  const key = getKey()
  const [ivB64, ciphertext, tagB64] = stored.split(':')
  if (!ivB64 || !ciphertext || !tagB64) {
    throw new Error('Invalid encrypted token format')
  }
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
