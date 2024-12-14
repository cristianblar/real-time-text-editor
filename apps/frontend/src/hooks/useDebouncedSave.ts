import { useState, useRef, useCallback } from "react";

export enum SaveStatus {
  IDLE,
  SAVING,
  UNSAVED,
}

export const useDebouncedSave = (
  saveCallback: (content: string) => void,
  delay = 5000,
) => {
  const [saveStatus, setSaveStatus] = useState(SaveStatus.IDLE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = useCallback(
    (content: string) => {
      setSaveStatus(SaveStatus.UNSAVED);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setSaveStatus(SaveStatus.SAVING);
        saveCallback(content);
        timerRef.current = null;
        setSaveStatus(SaveStatus.IDLE);
      }, delay);
    },
    [delay, saveCallback],
  );

  return { saveStatus, triggerSave };
};
