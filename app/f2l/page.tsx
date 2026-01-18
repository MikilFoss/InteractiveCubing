import Link from "next/link";
import { f2lAlgSet, f2lCategories } from "@/data/f2l";
import AlgSheet from "@/components/AlgSheet";

export default function F2LPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ color: "#6b7280", fontSize: "14px" }}>
              &larr; Back to Home
            </Link>
            <Link
              href="/timer"
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Start Timer
            </Link>
          </div>
          <h1 className="title" style={{ marginTop: "16px" }}>
            F2L Algorithms
          </h1>
          <p className="subtitle">
            All 41 First Two Layers cases with interactive 3D visualizations
          </p>
        </div>

        <AlgSheet algSet={f2lAlgSet} categories={f2lCategories} />
      </div>
    </main>
  );
}
