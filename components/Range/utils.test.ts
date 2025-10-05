import { clamp, snapToFixed, uniqSorted, valueToPct, pctToValue } from './utils';

test('clamp', () => {
  expect(clamp(5, 1, 10)).toBe(5);
  expect(clamp(-1, 1, 10)).toBe(1);
  expect(clamp(99, 1, 10)).toBe(10);
});

test('uniqSorted', () => {
  expect(uniqSorted([5, 1, 5, 3])).toEqual([1, 3, 5]);
});

test('snapToFixed', () => {
  expect(snapToFixed(6, [1, 5, 10])).toBe(5);
  expect(snapToFixed(8, [1, 5, 10])).toBe(10);
});

test('value<->pct', () => {
  const pct = valueToPct(50, 0, 100);
  expect(pct).toBe(50);
  const val = pctToValue(25, 0, 200);
  expect(val).toBe(50);
});
