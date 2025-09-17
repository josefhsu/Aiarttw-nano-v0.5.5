
import { useState, useCallback } from 'react';

type SetStateOptions = {
  addToHistory?: boolean;
};

export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = useCallback((
    action: T | ((prevState: T) => T),
    options: SetStateOptions = { addToHistory: true }
  ) => {
    const resolvedState = typeof action === 'function'
      ? (action as (prevState: T) => T)(history[currentIndex])
      : action;

    if (options.addToHistory) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(resolvedState);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    } else {
      const newHistory = [...history];
      newHistory[currentIndex] = resolvedState;
      setHistory(newHistory);
    }
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [canRedo]);
  
  return { state, setState, undo, redo, canUndo, canRedo };
};
