export function useLocalStorage<T>(key: string, initial: T) {
  const read = () => {
    try {
      const v = window.localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch { return initial; }
  };
  const write = (val: T) => {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
  };
  return { read, write };
}
