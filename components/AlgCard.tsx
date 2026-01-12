"use client";

import { useState } from "react";
import { AlgCase } from "@/types/alg";
import TwistyPlayer from "./TwistyPlayer";
import styles from "./AlgCard.module.css";

interface AlgCardProps {
  algCase: AlgCase;
}

export default function AlgCard({ algCase }: AlgCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAlgIndex, setSelectedAlgIndex] = useState(0);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(algCase.algs[selectedAlgIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.caseNumber}>#{algCase.id}</span>
        <span className={styles.caseName}>{algCase.name}</span>
      </div>

      <div className={styles.playerContainer}>
        <TwistyPlayer
          alg={algCase.algs[selectedAlgIndex]}
          setup={algCase.setup}
        />
      </div>

      <div className={styles.algSection}>
        {algCase.algs.length > 1 && (
          <div className={styles.algTabs}>
            {algCase.algs.map((_, index) => (
              <button
                key={index}
                className={`${styles.algTab} ${index === selectedAlgIndex ? styles.activeTab : ""}`}
                onClick={() => setSelectedAlgIndex(index)}
              >
                Alg {index + 1}
              </button>
            ))}
          </div>
        )}

        <div className={styles.algDisplay}>
          <code className={styles.algCode}>{algCase.algs[selectedAlgIndex]}</code>
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
