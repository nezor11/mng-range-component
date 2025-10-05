// components/Range/Range.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Range.module.css';
import { clamp, snapToFixed, valueToPct, pctToValue, uniqSorted } from './utils';
import type { RangeProps, RangeValue } from './Range.types';

export default function Range({
  mode,
  min = 0,
  max = 100,
  fixedValues = [],
  initialMin,
  initialMax,
  currency,
  onChange,
  className
}: RangeProps) {
  // Normaliza límites según modo
  const [lo, hi] = useMemo(() => {
    if (mode === 'fixed') {
      const vals = uniqSorted(fixedValues);
      return [vals[0] ?? 0, vals[vals.length - 1] ?? 0];
    }
    return [min, max];
  }, [mode, min, max, fixedValues]);

  // Estado controlado del rango actual
  const [value, setValue] = useState<RangeValue>(() => {
    if (mode === 'fixed') {
      const vals = uniqSorted(fixedValues);
      const start = vals[0] ?? 0;
      const end = vals[vals.length - 1] ?? start;
      const imin = initialMin ?? start;
      const imax = initialMax ?? end;
      const vmin = clamp(snapToFixed(imin, vals), start, snapToFixed(imax, vals));
      const vmax = clamp(snapToFixed(imax, vals), vmin, end);
      return { min: vmin, max: vmax };
    } else {
      const imin = initialMin ?? lo;
      const imax = initialMax ?? hi;
      const vmin = clamp(imin, lo, Math.min(imax, hi));
      const vmax = clamp(imax, Math.max(imin, lo), hi);
      return { min: vmin, max: vmax };
    }
  });

  // Avisar cambios (throttle-free y simple)
  useEffect(() => { onChange?.(value); }, [value, onChange]);

  // Refs para drag
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<null | 'min' | 'max'>(null);

  // Helpers
  const setMin = (n: number) => setValue(v => {
    const next = clamp(n, lo, v.max);
    return next === v.min ? v : { ...v, min: next };
  });
  const setMax = (n: number) => setValue(v => {
    const next = clamp(n, v.min, hi);
    return next === v.max ? v : { ...v, max: next };
  });

  const toPct = (n: number) => valueToPct(n, lo, hi);

  const startDrag = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    draggingRef.current = which;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = 'grabbing';
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const pct = (x / rect.width) * 100;
      let raw = pctToValue(pct, lo, hi);
      if (mode === 'fixed') raw = snapToFixed(raw, fixedValues);

      if (draggingRef.current === 'min') setMin(raw);
      else setMax(raw);
    };
    const onUp = () => { draggingRef.current = null; document.body.style.cursor = ''; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [lo, hi, mode, fixedValues]);

  // Teclado
  const stepFor = useCallback((which: 'min' | 'max') => {
    if (mode === 'fixed') return 1; // por índice
    return 1; // podrías parametrizar 'step'
  }, [mode]);

  const moveBy = (which: 'min' | 'max', delta: number) => {
    if (mode === 'fixed') {
      const list = uniqSorted(fixedValues);
      const curr = which === 'min' ? value.min : value.max;
      const idx = Math.max(0, list.findIndex(v => v === snapToFixed(curr, list)));
      const nextIdx = clamp(idx + delta, 0, list.length - 1);
      const candidate = list[nextIdx];
      which === 'min' ? setMin(candidate) : setMax(candidate);
    } else {
      const s = stepFor(which);
      which === 'min' ? setMin(value.min + delta * s) : setMax(value.max + delta * s);
    }
  };

  const setToBoundary = (which: 'min' | 'max', to: 'start' | 'end') => {
    if (which === 'min') setMin(to === 'start' ? lo : value.max);
    else setMax(to === 'end' ? hi : value.min);
  };

  // Labels (editables solo en normal)
  const [editing, setEditing] = useState<{ min: boolean; max: boolean }>({ min: false, max: false });

  const submitLabel = (which: 'min' | 'max', raw: string) => {
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    if (mode === 'fixed') return; // no editable en fixed
    which === 'min' ? setMin(parsed) : setMax(parsed);
    setEditing(e => ({ ...e, [which]: false }));
  };

  const formatted = (n: number) => currency ? `${n.toFixed(2)}${currency}` : `${n}`;

  return (
    <div className={`${styles.rangeContainer} ${className ?? ''}`}>
      {/* Label min */}
      <div className={styles.labelContainer}>
        {mode === 'fixed' ? (
          <span className={styles.label}>{formatted(value.min)}</span>
        ) : editing.min ? (
          <input
            className={styles.labelInput}
            autoFocus
            defaultValue={String(value.min)}
            onBlur={(e) => submitLabel('min', e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitLabel('min', (e.target as HTMLInputElement).value); }}
          />
        ) : (
          <button className={`${styles.label} ${styles.clickable}`} onClick={() => setEditing(e => ({ ...e, min: true }))}>
            {formatted(value.min)}
          </button>
        )}
      </div>

      {/* Track + handles */}
      <div ref={trackRef} className={styles.track}>
        <div className={styles.range} style={{
          left: `${toPct(value.min)}%`,
          width: `${toPct(value.max) - toPct(value.min)}%`
        }} />

        {/* Handle min */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Minimum value"
          aria-valuemin={lo}
          aria-valuemax={hi}
          aria-valuenow={value.min}
          className={styles.handle}
          style={{ left: `${toPct(value.min)}%` }}
          onPointerDown={startDrag('min')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') moveBy('min', +1);
            if (e.key === 'ArrowLeft') moveBy('min', -1);
            if (e.key === 'Home') setToBoundary('min', 'start');
            if (e.key === 'End') setToBoundary('min', 'end');
            if (e.key === 'PageUp') moveBy('min', +10);
            if (e.key === 'PageDown') moveBy('min', -10);
          }}
        />

        {/* Handle max */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Maximum value"
          aria-valuemin={lo}
          aria-valuemax={hi}
          aria-valuenow={value.max}
          className={styles.handle}
          style={{ left: `${toPct(value.max)}%` }}
          onPointerDown={startDrag('max')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') moveBy('max', +1);
            if (e.key === 'ArrowLeft') moveBy('max', -1);
            if (e.key === 'Home') setToBoundary('max', 'start');
            if (e.key === 'End') setToBoundary('max', 'end');
            if (e.key === 'PageUp') moveBy('max', +10);
            if (e.key === 'PageDown') moveBy('max', -10);
          }}
        />
      </div>

      {/* Label max */}
      <div className={styles.labelContainer}>
        {mode === 'fixed' ? (
          <span className={styles.label}>{formatted(value.max)}</span>
        ) : editing.max ? (
          <input
            className={styles.labelInput}
            autoFocus
            defaultValue={String(value.max)}
            onBlur={(e) => submitLabel('max', e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitLabel('max', (e.target as HTMLInputElement).value); }}
          />
        ) : (
          <button className={`${styles.label} ${styles.clickable}`} onClick={() => setEditing(e => ({ ...e, max: true }))}>
            {formatted(value.max)}
          </button>
        )}
      </div>
    </div>
  );
}
