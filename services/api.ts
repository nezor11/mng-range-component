import { normalRangeData, fixedRangeData } from "./mockData";

interface RangeData {
  min: number;
  max: number;
}

interface FixedRangeData {
  rangeValues: number[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RangeService {
  static async getNormalRange(): Promise<RangeData> {
    // Simular llamada API con delay
    await delay(100);
    return normalRangeData;
  }

  static async getFixedRange(): Promise<FixedRangeData> {
    // Simular llamada API con delay
    await delay(100);
    return fixedRangeData;
  }
}
