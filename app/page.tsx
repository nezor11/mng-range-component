import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <div className="home-content">
        <h2>Range Component Demo</h2>
        <p>
          This is a custom range slider component built for Mango&apos;s technical test.
          It supports two different modes:
        </p>

        <div className="cards">
          <Link href="/exercise1" className="card">
            <h3>Exercise 1: Normal Range</h3>
            <p>
              A standard range slider with minimum and maximum values.
              Users can drag handles and click on labels to edit values.
            </p>
            <span className="arrow">→</span>
          </Link>

          <Link href="/exercise2" className="card">
            <h3>Exercise 2: Fixed Values Range</h3>
            <p>
              A range slider with predefined fixed values.
              Users can only select from the available options.
            </p>
            <span className="arrow">→</span>
          </Link>
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✓ Custom slider component (no HTML5 range input)</li>
            <li>✓ Draggable handles with visual feedback</li>
            <li>✓ Editable labels (normal mode)</li>
            <li>✓ Mobile responsive</li>
            <li>✓ Accessibility support</li>
            <li>✓ Server-side data fetching</li>
          </ul>
        </div>
      </div>
    </div>
  );
}