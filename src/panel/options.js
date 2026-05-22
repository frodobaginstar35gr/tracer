async function load() {
  const data = await chrome.storage.local.get(['claudeApiKey', 'userEmail', 'userName', 'lastLetter']);
  if (data.claudeApiKey) document.getElementById('api-key').value = data.claudeApiKey;
  if (data.userName)    document.getElementById('user-name').value = data.userName;
  if (data.userEmail)   document.getElementById('user-email').value = data.userEmail;

  if (window.location.hash === '#letter' && data.lastLetter) {
    const section = document.getElementById('letter-section');
    section.style.display = 'flex';
    document.getElementById('letter-output').value = data.lastLetter;
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

document.getElementById('save-key').addEventListener('click', async () => {
  const key = document.getElementById('api-key').value.trim();
  await chrome.storage.local.set({ claudeApiKey: key });
  document.getElementById('key-status').textContent = 'Saved!';
  setTimeout(() => (document.getElementById('key-status').textContent = ''), 2000);
});

document.getElementById('save-identity').addEventListener('click', async () => {
  await chrome.storage.local.set({
    userName: document.getElementById('user-name').value.trim(),
    userEmail: document.getElementById('user-email').value.trim(),
  });
});

document.getElementById('copy-letter').addEventListener('click', () => {
  const text = document.getElementById('letter-output').value;
  navigator.clipboard.writeText(text);
  document.getElementById('copy-letter').textContent = 'Copied!';
  setTimeout(() => (document.getElementById('copy-letter').textContent = 'Copy to Clipboard'), 2000);
});

load();
