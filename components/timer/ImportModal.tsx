'use client';

import { useState, useCallback } from 'react';
import { SolveResult, ImportConfig } from '@/types/timer';
import { previewImport, importCsTimerData } from '@/lib/storage/importExport';
import styles from './Timer.module.css';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (solves: SolveResult[]) => Promise<void>;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
}: ImportModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [distributeEvenly, setDistributeEvenly] = useState(true);
  const [preview, setPreview] = useState<{
    count: number;
    originalDateRange: { start: Date; end: Date } | null;
    sessions: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        setError(null);

        try {
          const previewData = previewImport(content);
          setPreview(previewData);

          if (previewData.count === 0) {
            setError('No valid solves found in file');
          }
        } catch (err) {
          setError('Invalid file format');
          setPreview(null);
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handleImport = async () => {
    if (!fileContent || !preview || preview.count === 0) return;

    setImporting(true);
    setError(null);

    try {
      const config: ImportConfig = {
        startDate: distributeEvenly && startDate
          ? new Date(startDate)
          : preview.originalDateRange?.start || new Date(),
        distributeEvenly: distributeEvenly && !!startDate,
      };

      const solves = importCsTimerData(fileContent, config);
      await onImport(solves);
      onClose();

      // Reset state
      setFileContent(null);
      setPreview(null);
      setStartDate('');
    } catch (err) {
      setError('Failed to import data');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFileContent(null);
    setPreview(null);
    setStartDate('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Import csTimer Data</span>
          <button className={styles.modalClose} onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Select csTimer Export File
            </label>
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <p className={styles.formHint}>
              Export your times from csTimer using Export &rarr; Export to file
            </p>
          </div>

          {preview && preview.count > 0 && (
            <>
              <div className={styles.previewBox}>
                <div className={styles.previewTitle}>Import Preview</div>
                <div className={styles.previewItem}>
                  <span>Total Solves</span>
                  <span className={styles.previewValue}>{preview.count}</span>
                </div>
                <div className={styles.previewItem}>
                  <span>Sessions</span>
                  <span className={styles.previewValue}>{preview.sessions}</span>
                </div>
                {preview.originalDateRange && (
                  <div className={styles.previewItem}>
                    <span>Original Date Range</span>
                    <span className={styles.previewValue}>
                      {preview.originalDateRange.start.toLocaleDateString()} -{' '}
                      {preview.originalDateRange.end.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={distributeEvenly}
                    onChange={(e) => setDistributeEvenly(e.target.checked)}
                  />
                  <span>Distribute times evenly from a start date</span>
                </label>
                <p className={styles.formHint}>
                  Spread all imported times evenly between the start date and today
                </p>
              </div>

              {distributeEvenly && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Cubing Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateInput}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className={styles.formHint}>
                    When did you start cubing? Times will be spread from this date to now.
                  </p>
                </div>
              )}
            </>
          )}

          {error && (
            <div
              style={{
                color: '#ef4444',
                fontSize: '14px',
                marginTop: '12px',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleImport}
            disabled={
              !preview ||
              preview.count === 0 ||
              importing ||
              (distributeEvenly && !startDate)
            }
          >
            {importing ? 'Importing...' : `Import ${preview?.count || 0} Solves`}
          </button>
        </div>
      </div>
    </div>
  );
}
