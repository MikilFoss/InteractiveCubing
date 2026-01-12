import Link from "next/link";
import { f2lAlgSet, f2lCategories } from "@/data/f2l";
import AlgSheet from "@/components/AlgSheet";

export default function F2LPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <Link href="/" style={{ color: "#6b7280", fontSize: "14px" }}>
            &larr; Back to Home
          </Link>
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
