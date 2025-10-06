import Link from 'next/link';
import { Suspense } from 'react';

import Range from '@/components/Range/Range';
import { RangeService } from '@/services/api';

async function FixedRangeComponent() {
  const data = await RangeService.getFixedRange();
  return <Range mode="fixed" fixedValues={data.rangeValues} currency="€" />;
}

export default function Page() {
  return (
    <section style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h2>Exercise 2: Fixed Values Range</h2>
      <ul>
        <li>Selección solo entre valores predefinidos</li>
        <li>Snap al valor más cercano</li>
        <li>Labels no editables</li>
        <li>Los handles no se cruzan</li>
      </ul>
      <div style={{ marginTop: 24 }}>
        <Suspense fallback={<div>Loading range data...</div>}>
          <FixedRangeComponent />
        </Suspense>
      </div>
      <p style={{ marginTop: 24 }}><Link href="/">← Volver</Link></p>
    </section>
  );
}
