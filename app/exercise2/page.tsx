import { Suspense } from "react";
import Link from "next/link";
import Range from "@/components/Range/Range";
import { RangeService } from "@/services/api";

async function FixedRangeComponent() {
  const data = await RangeService.getFixedRange();
  return <Range mode="fixed" fixedValues={data.rangeValues} currency="€" />;
}

export default function Page() {
  return (
    <div className="container">
      <div className="home-content">
        <h2>Exercise 2: Fixed Values Range</h2>
        <ul>
          <li>• Select only from predefined values</li>
          <li>• Snaps to nearest step</li>
          <li>• Labels are not editable</li>
          <li>• Handles cannot cross each other</li>
        </ul>
        <div className="demo-section">
          <h3>Demo</h3>
          <Suspense fallback={<div className="loading">Loading range data...</div>}>
            <FixedRangeComponent />
          </Suspense>
        </div>
        <p><Link href="/">← Back</Link></p>
      </div>
    </div>
  );
}
