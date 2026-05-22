const STORAGE_KEY = 'tracer_detected';
const MAX_ENTRIES = 500;

export class TrackerStore {
  async getAll() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve(result[STORAGE_KEY] ?? []);
      });
    });
  }

  async save(tracker) {
    const existing = await this.getAll();
    const updated = [tracker, ...existing].slice(0, MAX_ENTRIES);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, resolve);
    });
  }

  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(STORAGE_KEY, resolve);
    });
  }
}
