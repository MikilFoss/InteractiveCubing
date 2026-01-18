'use client';

import { useState, useEffect } from 'react';
import { TimerSettings, VisualizationMode } from '@/types/timer';
import styles from './Timer.module.css';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: Partial<TimerSettings>) => void;
}

export default function OptionsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: OptionsModalProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);

  // Sync with external settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Timer Options</span>
          <button className={styles.modalClose} onClick={handleCancel}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Cube Visualization Mode */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Cube Visualization</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioOption} ${
                  localSettings.visualizationMode === 'net2d'
                    ? styles.radioOptionSelected
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="visualizationMode"
                  checked={localSettings.visualizationMode === 'net2d'}
                  onChange={() =>
                    setLocalSettings((s) => ({
                      ...s,
                      visualizationMode: 'net2d' as VisualizationMode,
                    }))
                  }
                />
                <div>
                  <div className={styles.radioLabel}>2D Net (Unwrapped)</div>
                  <div className={styles.radioDescription}>
                    Flat view showing all faces like csTimer
                  </div>
                </div>
              </label>
              <label
                className={`${styles.radioOption} ${
                  localSettings.visualizationMode === '3d'
                    ? styles.radioOptionSelected
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="visualizationMode"
                  checked={localSettings.visualizationMode === '3d'}
                  onChange={() =>
                    setLocalSettings((s) => ({
                      ...s,
                      visualizationMode: '3d' as VisualizationMode,
                    }))
                  }
                />
                <div>
                  <div className={styles.radioLabel}>3D Cube</div>
                  <div className={styles.radioDescription}>
                    Interactive 3D view of the cube
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Show Visualization */}
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={localSettings.showVisualization}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    showVisualization: e.target.checked,
                  }))
                }
              />
              <span>Show scramble visualization</span>
            </label>
            <p className={styles.formHint}>
              Display the cube state after applying the scramble
            </p>
          </div>

          {/* Hold Time */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Hold Time: {localSettings.holdTime}ms
            </label>
            <input
              type="range"
              min="300"
              max="1000"
              step="100"
              value={localSettings.holdTime}
              onChange={(e) =>
                setLocalSettings((s) => ({
                  ...s,
                  holdTime: parseInt(e.target.value),
                }))
              }
              style={{ width: '100%' }}
            />
            <p className={styles.formHint}>
              How long to hold spacebar before the timer is ready (red → green)
            </p>
          </div>

          {/* Display Precision */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Display Precision</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioOption} ${
                  localSettings.displayPrecision === 2
                    ? styles.radioOptionSelected
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="displayPrecision"
                  checked={localSettings.displayPrecision === 2}
                  onChange={() =>
                    setLocalSettings((s) => ({ ...s, displayPrecision: 2 }))
                  }
                />
                <div>
                  <div className={styles.radioLabel}>2 decimals</div>
                  <div className={styles.radioDescription}>12.34</div>
                </div>
              </label>
              <label
                className={`${styles.radioOption} ${
                  localSettings.displayPrecision === 3
                    ? styles.radioOptionSelected
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="displayPrecision"
                  checked={localSettings.displayPrecision === 3}
                  onChange={() =>
                    setLocalSettings((s) => ({ ...s, displayPrecision: 3 }))
                  }
                />
                <div>
                  <div className={styles.radioLabel}>3 decimals</div>
                  <div className={styles.radioDescription}>12.345</div>
                </div>
              </label>
            </div>
          </div>

          {/* Hide Time While Running */}
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={localSettings.hideTimeWhileRunning}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    hideTimeWhileRunning: e.target.checked,
                  }))
                }
              />
              <span>Hide time while running</span>
            </label>
            <p className={styles.formHint}>
              Show &quot;Solving...&quot; instead of the live time
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
