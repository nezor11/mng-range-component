import { Suspense } from "react";
import Link from "next/link";
import Range from "@/components/Range/Range";
import { RangeService } from "@/services/api";

async function NormalRangeComponent() {
  const data = await RangeService.getNormalRange();
  return (
    <Range mode="normal" min={data.min} max={data.max} initialMin={10} initialMax={70} />
  );
}

export default function Page() {
  return (
    <div className="container">
      <div className="home-content">
        <h2>Exercise 1: Normal Range</h2>
        <p>Custom range with editable labels and two handles.</p>
        <ul>
          <li>• Click on the min/max labels to edit values directly</li>
          <li>• Values are constrained within the valid range</li>
          <li>• Handles cannot cross each other</li>
        </ul>
        <div className="demo-section">
          <h3>Demo</h3>
          <Suspense fallback={<div className="loading">Loading range data...</div>}>
            <NormalRangeComponent />
          </Suspense>
        </div>
        <p><Link href="/">← Back</Link></p>
      </div>
    </div>
  );
}
