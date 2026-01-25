import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <h1 className="title">Interactive Cubing</h1>
          <p className="subtitle">
            Learn and master Rubik&apos;s cube algorithms with interactive 3D visualizations
          </p>
        </div>

        <nav className="nav">
          <Link href="/f2l" className="navLink">
            F2L Algorithms
          </Link>
          <Link href="/timer" className="navLink">
            Timer
          </Link>
          <Link href="/training" className="navLink">
            Training
          </Link>
        </nav>

        <section style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#374151" }}>
            What is F2L?
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            F2L (First Two Layers) is the second step of the CFOP method for solving the Rubik&apos;s
            cube. After solving the cross, you pair up corner and edge pieces and insert them into
            their slots simultaneously.
          </p>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            There are 41 distinct F2L cases. While intuitive F2L is recommended for beginners,
            learning algorithmic solutions for each case can significantly improve your solve times.
          </p>
          <p style={{ color: "#6b7280" }}>
            Use the interactive 3D viewer to see how each algorithm works, and practice until the
            patterns become second nature.
          </p>
        </section>
      </div>
    </main>
  );
}
