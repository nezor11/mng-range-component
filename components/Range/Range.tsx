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
  const modeValue = mode as 'normal' | 'fixed';

  // límites efectivos (en fixed vienen de los propios valores fijos)
  const [lo, hi] = useMemo(() => {
    if (modeValue === 'fixed') {
      const vals = uniqSorted(fixedValues);
      return [vals[0] ?? 0, vals[vals.length - 1] ?? 0];
    }
    return [min, max];
  }, [modeValue, min, max, fixedValues]);

  // helpers de formato/precisión
  const round2 = (x: number) => Math.round(x * 100) / 100;
  const format = (n: number) =>
    currency ? `${round2(n).toFixed(2)}${currency}` : round2(n).toFixed(2);

  // estado del rango
  const [value, setValue] = useState<RangeValue>(() => {
    if (modeValue === 'fixed') {
      const vals = uniqSorted(fixedValues);
      const start = vals[0] ?? 0;
      const end = vals[vals.length - 1] ?? start;
      const imin = initialMin ?? start;
      const imax = initialMax ?? end;
      const vmin = clamp(snapToFixed(imin, vals), start, snapToFixed(imax, vals));
      const vmax = clamp(snapToFixed(imax, vals), vmin, end);
      return { min: round2(vmin), max: round2(vmax) };
    } else {
      const imin = initialMin ?? lo;
      const imax = initialMax ?? hi;
      const vmin = clamp(imin, lo, Math.min(imax, hi));
      const vmax = clamp(imax, Math.max(imin, lo), hi);
      return { min: round2(vmin), max: round2(vmax) };
    }
  });

  // emite cambios
  useEffect(() => { onChange?.(value); }, [value, onChange]);

  // refs + tooltip
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<null | 'min' | 'max'>(null);

  const [showTooltip, setShowTooltip] = useState<null | 'min' | 'max'>(null);
  const [tooltipLeft, setTooltipLeft] = useState<number>(0);
  const [tooltipValue, setTooltipValue] = useState<number>(0);

  // setters clamp-safe + redondeo a 2 decimales
  const setMin = useCallback((n: number) => {
    setValue(v => {
      const r = round2(n);
      const next = clamp(r, lo, v.max);
      return next === v.min ? v : { ...v, min: next };
    });
  }, [lo]);

  const setMax = useCallback((n: number) => {
    setValue(v => {
      const r = round2(n);
      const next = clamp(r, v.min, hi);
      return next === v.max ? v : { ...v, max: next };
    });
  }, [hi]);

  const toPct = (n: number) => valueToPct(n, lo, hi);

  const startDrag = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    draggingRef.current = which;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = 'grabbing';
  };

  // pointer events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const pct = (x / rect.width) * 100;
      let raw = pctToValue(pct, lo, hi);
      if (modeValue === 'fixed') raw = snapToFixed(raw, fixedValues);

      if (draggingRef.current === 'min') setMin(raw);
      else setMax(raw);

      setShowTooltip(draggingRef.current);
      setTooltipLeft(x);
      setTooltipValue(raw);
    };
    const onUp = () => {
      draggingRef.current = null;
      document.body.style.cursor = '';
      setShowTooltip(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [lo, hi, modeValue, fixedValues, setMin, setMax]);

  // teclado
  const moveBy = (which: 'min' | 'max', delta: number) => {
    if (modeValue === 'fixed') {
      const list = uniqSorted(fixedValues);
      const curr = which === 'min' ? value.min : value.max;
      const idx = Math.max(0, list.findIndex(v => v === snapToFixed(curr, list)));
      const nextIdx = clamp(idx + delta, 0, list.length - 1);
      const candidate = list[nextIdx];
      which === 'min' ? setMin(candidate) : setMax(candidate);
    } else {
      const step = 1;
      which === 'min' ? setMin(value.min + delta * step) : setMax(value.max + delta * step);
    }
  };

  const setToBoundary = (which: 'min' | 'max', to: 'start' | 'end') => {
    if (which === 'min') setMin(to === 'start' ? lo : value.max);
    else setMax(to === 'end' ? hi : value.min);
  };

  // edición por label
  const [editing, setEditing] = useState<{ min: boolean; max: boolean }>({ min: false, max: false });
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing.min) minInputRef.current?.focus();
    if (editing.max) maxInputRef.current?.focus();
  }, [editing.min, editing.max]);

  const submitLabel = (which: 'min' | 'max', raw: string) => {
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    if (modeValue === 'fixed') return; // no editable en fixed
    const fixed = round2(parsed);
    which === 'min' ? setMin(fixed) : setMax(fixed);
    setEditing(e => ({ ...e, [which]: false }));
  };

  return (
    <div className={`${styles.rangeContainer} ${className ?? ''}`}>
      {/* Label min */}
      <div className={styles.labelContainer}>
        {modeValue === 'fixed' ? (
          <span className={styles.label}>{format(value.min)}</span>
        ) : editing.min ? (
          <input
            ref={minInputRef}
            className={styles.labelInput}
            defaultValue={value.min.toFixed(2)}
            inputMode="decimal"
            step="0.01"
            pattern="^-?\\d+(?:[\\.,]\\d{0,2})?$"
            onBlur={(e) => submitLabel('min', e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitLabel('min', (e.target as HTMLInputElement).value); }}
          />
        ) : (
          <button className={`${styles.label} ${styles.clickable}`} onClick={() => setEditing(e => ({ ...e, min: true }))}>
            {format(value.min)}
          </button>
        )}
      </div>

      {/* Track + handles */}
      <div ref={trackRef} className={styles.track}>
        <div
          className={styles.range}
          style={{
            left: `${toPct(value.min)}%`,
            width: `${toPct(value.max) - toPct(value.min)}%`
          }}
        />

        {/* Handle min */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Minimum value"
          aria-valuemin={lo}
          aria-valuemax={hi}
          aria-valuenow={value.min}
          aria-valuetext={format(value.min)}
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
          onMouseEnter={() => {
            if (!trackRef.current) return;
            const w = trackRef.current.getBoundingClientRect().width;
            setTooltipLeft(w * toPct(value.min) / 100);
            setTooltipValue(value.min);
            setShowTooltip('min');
          }}
          onMouseLeave={() => setShowTooltip(null)}
        />

        {/* Handle max */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Maximum value"
          aria-valuemin={lo}
          aria-valuemax={hi}
          aria-valuenow={value.max}
          aria-valuetext={format(value.max)}
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
          onMouseEnter={() => {
            if (!trackRef.current) return;
            const w = trackRef.current.getBoundingClientRect().width;
            setTooltipLeft(w * toPct(value.max) / 100);
            setTooltipValue(value.max);
            setShowTooltip('max');
          }}
          onMouseLeave={() => setShowTooltip(null)}
        />

        {/* Tooltip */}
        {showTooltip && (
          <div
            className={styles.tooltip}
            style={{ left: tooltipLeft, transform: 'translateX(-50%)', top: -32 }}
            aria-hidden="true"
          >
            {format(tooltipValue)}
          </div>
        )}

        {/* Always-visible values above each handle in NORMAL mode */}
        {modeValue === 'normal' && (
          <>
            <div
              className={styles.handleValue}
              style={{ left: `${toPct(value.min)}%` }}
              aria-hidden
            >
              {format(value.min)}
            </div>
            <div
              className={styles.handleValue}
              style={{ left: `${toPct(value.max)}%` }}
              aria-hidden
            >
              {format(value.max)}
            </div>
          </>
        )}
      </div>

      {/* Label max */}
      <div className={styles.labelContainer}>
        {modeValue === 'fixed' ? (
          <span className={styles.label}>{format(value.max)}</span>
        ) : editing.max ? (
          <input
            ref={maxInputRef}
            className={styles.labelInput}
            defaultValue={value.max.toFixed(2)}
            inputMode="decimal"
            step="0.01"
            pattern="^-?\\d+(?:[\\.,]\\d{0,2})?$"
            onBlur={(e) => submitLabel('max', e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitLabel('max', (e.target as HTMLInputElement).value); }}
          />
        ) : (
          <button className={`${styles.label} ${styles.clickable}`} onClick={() => setEditing(e => ({ ...e, max: true }))}>
            {format(value.max)}
          </button>
        )}
      </div>

      {/* Visible clamp bounds under the track in NORMAL mode */}
      {modeValue === 'normal' && (
        <div className={styles.bounds}>
          <div className={styles.boundLabel} style={{ left: '0%' }}>
            {format(lo)}
          </div>
          <div className={styles.boundLabel} style={{ left: '100%' }}>
            {format(hi)}
          </div>
        </div>
      )}

      {/* Ticks (solo en fixed) */}
      {modeValue === 'fixed' && (
        <div className={styles.ticks}>
          {uniqSorted(fixedValues).map((v) => (
            <div key={v} className={styles.tick} style={{ left: `${toPct(v)}%` }}>
              <span>{format(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
