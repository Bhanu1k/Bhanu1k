import { test } from 'node:test'
import assert from 'node:assert/strict'
import { amountInWords } from './words.ts'

test('quotation SS/1006 total', () => {
  assert.equal(amountInWords(48250), 'Forty-Eight Thousand Two Hundred Fifty Only')
})
test('lakh and crore', () => {
  assert.equal(amountInWords(125000), 'One Lakh Twenty-Five Thousand Only')
  assert.equal(amountInWords(100000000), 'Ten Crore Only')
  assert.equal(amountInWords(1234567), 'Twelve Lakh Thirty-Four Thousand Five Hundred Sixty-Seven Only')
})
test('paise and zero', () => {
  assert.equal(amountInWords(100.5), 'One Hundred and Fifty Paise Only')
  assert.equal(amountInWords(0), 'Zero Only')
})
