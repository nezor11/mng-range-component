export type RangeMode = "normal" | "fixed";

export interface RangeValue {
  min: number;
  max: number;
}

export interface RangeProps {
  mode: RangeMode;
  min?: number;
  max?: number;
  fixedValues?: number[];
  initialMin?: number;
  initialMax?: number;
  currency?: string;
  onChange?: (value: RangeValue) => void;
  className?: string;
}
