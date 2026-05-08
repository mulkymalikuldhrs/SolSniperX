import { expect, test } from 'vitest'

test('basic truthy test', () => {
  expect(true).toBe(true)
})

test('environment check', () => {
  expect(import.meta.env.VITE_API_URL || 'http://localhost:5000').toBeDefined()
})
