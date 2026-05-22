import { classifyRequest } from '../utils/classifier.js';
import { TrackerStore } from '../utils/tracker-store.js';

const store = new TrackerStore();

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (details.initiator && details.url !== details.initiator) {
      const result = await classifyRequest(details);
      if (result.isTracker) {
        await store.save(result);
        chrome.runtime.sendMessage({ type: 'TRACKER_DETECTED', payload: result }).catch(() => {});
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TRACKERS') {
    store.getAll().then(sendResponse);
    return true;
  }
  if (message.type === 'CLEAR_TRACKERS') {
    store.clear().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'GENERATE_DELETION_REQUEST') {
    import('../utils/gdpr-generator.js').then(({ generateDeletionRequest }) =>
      generateDeletionRequest(message.payload).then(sendResponse)
    );
    return true;
  }
});
