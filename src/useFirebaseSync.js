import { useEffect, useRef, useState } from 'react';
import { db, ref, set, onValue } from './firebase';

const DEBOUNCE_MS = 300;

export function useFirebaseSync(firebasePath, localState, setLocalState, { enabled = true } = {}) {
  const timerRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const lastWrittenJson = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !firebasePath) return;
    setReady(false);
    const dbRef = ref(db, firebasePath);
    let first = true;
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (first) {
        first = false;
        if (val !== null && val !== undefined) {
          console.log('[Firebase] loaded from', firebasePath);
          isRemoteUpdate.current = true;
          lastWrittenJson.current = JSON.stringify(val);
          setLocalState(val);
          setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        } else {
          console.log('[Firebase] empty, will upload local state to', firebasePath);
        }
        setReady(true);
        return;
      }
      if (val === null || val === undefined) return;
      const json = JSON.stringify(val);
      if (json === lastWrittenJson.current) return;
      console.log('[Firebase] remote update on', firebasePath);
      isRemoteUpdate.current = true;
      lastWrittenJson.current = json;
      setLocalState(val);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    }, (err) => {
      console.warn('[Firebase] listener error on', firebasePath, err.message);
    });
    return () => { unsub(); setReady(false); };
  }, [firebasePath, enabled]);

  useEffect(() => {
    if (!enabled || !firebasePath || !ready) return;
    if (isRemoteUpdate.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const json = JSON.stringify(localState);
      if (json === lastWrittenJson.current) return;
      lastWrittenJson.current = json;
      console.log('[Firebase] writing to', firebasePath);
      const dbRef = ref(db, firebasePath);
      set(dbRef, localState).catch(err => {
        console.warn('[Firebase] write error on', firebasePath, err.message);
      });
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [localState, firebasePath, enabled, ready]);
}

export function firebaseWrite(path, value) {
  const dbRef = ref(db, path);
  return set(dbRef, value).catch(err => {
    console.warn('[Firebase] direct write error on', path, err.message);
  });
}
