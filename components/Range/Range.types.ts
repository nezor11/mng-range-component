export type RangeValue = {
  min: number;
  max: number;
};

export type RangeProps = {
  mode: 'normal' | 'fixed';
  /** Only for mode="normal" */
  min?: number;
  /** Only for mode="normal" */
  max?: number;
  /** Only for mode="fixed" */
  fixedValues?: number[];
  initialMin?: number;
  initialMax?: number;
  /** e.g. "€" (appended to formatted values) */
  currency?: string;
  onChange?: (value: RangeValue) => void;
  className?: string;
};
