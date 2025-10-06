import Link from 'next/link';
import { Suspense } from 'react';

import Range from '@/components/Range/Range';
import { RangeService } from '@/services/api';

async function NormalRangeComponent() {
  const data = await RangeService.getNormalRange();
  return (
    <Range mode="normal" min={data.min} max={data.max} initialMin={10} initialMax={70} />
  );
}

export default function Page() {
  return (
    <section style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h2>Exercise 1: Normal Range</h2>
      <ul>
        <li>Click en min/max para editar</li>
        <li>Clamp dentro del rango</li>
        <li>Los handles no se cruzan</li>
      </ul>
      <div style={{ marginTop: 24 }}>
        <Suspense fallback={<div>Loading range data...</div>}>
          <NormalRangeComponent />
        </Suspense>
      </div>
      <p style={{ marginTop: 24 }}><Link href="/">← Volver</Link></p>
    </section>
  );
}
