import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>Mango — Range Component</h1>
      <p>Selecciona un ejercicio:</p>
      <ul>
        <li><Link href="/exercise1">Exercise 1 — Normal Range</Link></li>
        <li><Link href="/exercise2">Exercise 2 — Fixed Values Range</Link></li>
      </ul>
    </main>
  );
}
