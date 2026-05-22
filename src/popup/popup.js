const list = document.getElementById('tracker-list');
const badge = document.getElementById('count-badge');
const btnGenerate = document.getElementById('btn-generate');
const btnClear = document.getElementById('btn-clear');
const btnSettings = document.getElementById('btn-settings');

btnSettings.href = chrome.runtime.getURL('src/panel/options.html');

async function loadTrackers() {
  const trackers = await chrome.runtime.sendMessage({ type: 'GET_TRACKERS' });
  render(trackers ?? []);
}

function render(trackers) {
  badge.textContent = `${trackers.length} tracker${trackers.length !== 1 ? 's' : ''}`;
  btnGenerate.disabled = trackers.length === 0;

  if (trackers.length === 0) {
    list.innerHTML = '<p class="empty-state">No trackers detected yet. Browse a site to begin.</p>';
    return;
  }

  list.innerHTML = trackers
    .slice(0, 100)
    .map(
      (t) => `
    <div class="tracker-item">
      <span class="category-dot ${t.category ?? 'unknown'}"></span>
      <span class="tracker-domain">${t.domain}</span>
      <span class="tracker-category">${t.category ?? 'unknown'}</span>
    </div>`
    )
    .join('');
}

btnClear.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'CLEAR_TRACKERS' });
  render([]);
});

btnGenerate.addEventListener('click', async () => {
  const trackers = await chrome.runtime.sendMessage({ type: 'GET_TRACKERS' });
  const { userEmail, userName } = await chrome.storage.local.get(['userEmail', 'userName']);
  btnGenerate.textContent = 'Generating…';
  btnGenerate.disabled = true;
  const result = await chrome.runtime.sendMessage({
    type: 'GENERATE_DELETION_REQUEST',
    payload: { trackers, userEmail, userName },
  });
  await chrome.storage.local.set({ lastLetter: result.letter });
  window.open(chrome.runtime.getURL('src/panel/options.html#letter'));
  btnGenerate.textContent = 'Generate Deletion Request';
  btnGenerate.disabled = false;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TRACKER_DETECTED') loadTrackers();
});

loadTrackers();
