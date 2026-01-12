"use client";

import { useState } from "react";
import { AlgSet } from "@/types/alg";
import AlgCard from "./AlgCard";
import styles from "./AlgSheet.module.css";

interface AlgSheetProps {
  algSet: AlgSet;
  categories: readonly string[];
}

export default function AlgSheet({ algSet, categories }: AlgSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<boolean | null>(null);

  const showSubFilters = selectedCategory === "Corner in U, Edge in U";

  const filteredCases = (() => {
    let cases = selectedCategory
      ? algSet.cases.filter((c) => c.category === selectedCategory)
      : algSet.cases;

    if (showSubFilters && selectedSplit !== null) {
      cases = cases.filter((c) => c.split === selectedSplit);
    }

    return cases;
  })();

  const getCategoryCount = (category: string) => {
    return algSet.cases.filter((c) => c.category === category).length;
  };

  const getSplitCount = (split: boolean) => {
    return algSet.cases.filter(
      (c) => c.category === "Corner in U, Edge in U" && c.split === split
    ).length;
  };

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedSplit(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${selectedCategory === null ? styles.activeFilter : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          All ({algSet.cases.length})
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.filterButton} ${selectedCategory === category ? styles.activeFilter : ""}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category} ({getCategoryCount(category)})
          </button>
        ))}
      </div>

      {showSubFilters && (
        <div className={styles.subFilters}>
          <button
            className={`${styles.filterButton} ${selectedSplit === null ? styles.activeFilter : ""}`}
            onClick={() => setSelectedSplit(null)}
          >
            All ({getCategoryCount("Corner in U, Edge in U")})
          </button>
          <button
            className={`${styles.filterButton} ${selectedSplit === false ? styles.activeFilter : ""}`}
            onClick={() => setSelectedSplit(false)}
          >
            Not Split ({getSplitCount(false)})
          </button>
          <button
            className={`${styles.filterButton} ${selectedSplit === true ? styles.activeFilter : ""}`}
            onClick={() => setSelectedSplit(true)}
          >
            Split ({getSplitCount(true)})
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {filteredCases.map((algCase) => (
          <AlgCard key={algCase.id} algCase={algCase} />
        ))}
      </div>
    </div>
  );
}
