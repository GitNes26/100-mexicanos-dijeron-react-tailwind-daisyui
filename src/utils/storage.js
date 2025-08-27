export const saveState = (key, value) => {
   try {
      localStorage.setItem(key, JSON.stringify(value));
   } catch (e) {
      console.warn("Save failed", e);
   }
};
export const loadState = (key, fallback) => {
   try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
   } catch (e) {
      return fallback;
   }
};
