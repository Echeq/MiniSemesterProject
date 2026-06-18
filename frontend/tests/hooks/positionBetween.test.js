import { describe, it, expect } from 'vitest'
import { positionBetween } from '../../src/hooks/useBoard'

describe('positionBetween helper (drag & drop positioning)', () => {
  it('midpoint between two values', () => {
    expect(positionBetween(100, 200)).toBe(150)
  })

  it('after last card: max + 1024', () => {
    expect(positionBetween(5000, null)).toBe(6024)
  })

  it('before first card: below - 1024', () => {
    expect(positionBetween(null, 500)).toBe(-524)
  })

  it('no cards: default 1024', () => {
    expect(positionBetween(null, null)).toBe(1024)
  })
})
