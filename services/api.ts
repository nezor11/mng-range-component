// services/api.ts
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const RangeService = {
  async getNormalRange(): Promise<{ min: number; max: number }> {
    await delay(200);
    return { min: 1, max: 100 };
  },
  async getFixedRange(): Promise<{ rangeValues: number[] }> {
    await delay(200);
    return { rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] };
  },
};
