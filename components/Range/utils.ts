export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const valueToPct = (v: number, min: number, max: number) =>
  max === min ? 0 : ((v - min) / (max - min)) * 100;

export const pctToValue = (pct: number, min: number, max: number) =>
  min + (pct / 100) * (max - min);

export const uniqSorted = (arr: number[]) =>
  Array.from(new Set(arr)).sort((a, b) => a - b);

export const snapToFixed = (v: number, fixed: number[]) => {
  if (!fixed.length) return v;
  return fixed.reduce((prev, curr) =>
    Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
    , fixed[0]);
};
