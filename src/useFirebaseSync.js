import { useEffect, useRef, useCallback } from 'react';
import { db, ref, set, onValue } from './firebase';

const DEBOUNCE_MS = 300;

export function useFirebaseSync(firebasePath, localState, setLocalState, { enabled = true, merge } = {}) {
  const timerRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const lastWrittenJson = useRef(null);

  // Listen to Firebase changes → update local state
  useEffect(() => {
    if (!enabled || !firebasePath) return;
    const dbRef = ref(db, firebasePath);
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val === null || val === undefined) return;
      const json = JSON.stringify(val);
      if (json === lastWrittenJson.current) return;
      isRemoteUpdate.current = true;
      if (merge) {
        setLocalState(prev => merge(prev, val));
      } else {
        setLocalState(val);
      }
      setTimeout(() => { isRemoteUpdate.current = false; }, 50);
    }, (err) => {
      console.warn('[Firebase] listener error on', firebasePath, err.message);
    });
    return () => unsub();
  }, [firebasePath, enabled]);

  // Write local state to Firebase (debounced)
  useEffect(() => {
    if (!enabled || !firebasePath) return;
    if (isRemoteUpdate.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const json = JSON.stringify(localState);
      if (json === lastWrittenJson.current) return;
      lastWrittenJson.current = json;
      const dbRef = ref(db, firebasePath);
      set(dbRef, localState).catch(err => {
        console.warn('[Firebase] write error on', firebasePath, err.message);
      });
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [localState, firebasePath, enabled]);
}

export function firebaseWrite(path, value) {
  const dbRef = ref(db, path);
  return set(dbRef, value).catch(err => {
    console.warn('[Firebase] direct write error on', path, err.message);
  });
}
