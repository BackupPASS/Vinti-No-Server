const retryBtn = document.getElementById('retry-btn');
const card = document.getElementById('downtime-card');
const lastCheck = document.getElementById('last-check');
const statusPill = document.getElementById('status-pill');
const reasonPill = document.getElementById('reason-pill');
const subtitleText = document.getElementById('subtitle-text');

function updateLastCheck() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (lastCheck) {
    lastCheck.textContent = 'Last check: ' + time;
  }
}

function applyStatus(status) {
  if (!statusPill) return;

  const s = status.toLowerCase().trim();

  statusPill.classList.remove('danger', 'ok', 'warning', 'neutral');

  let label = 'Status: ' + status.charAt(0).toUpperCase() + status.slice(1);

  let subtitle = 'Vinti status is unknown.';

  switch (s) {
    case 'online':
      statusPill.classList.add('ok');
      label = 'Status: Online';
      subtitle = 'Vinti is currently Online.';
      break;

    case 'offline':
      statusPill.classList.add('danger');
      label = 'Status: Offline';
      subtitle = 'Vinti is currently Offline.';
      break;

    case 'downtime':
      statusPill.classList.add('warning');
      label = 'Status: Downtime';
      subtitle = 'Vinti is experiencing Downtime.';
      break;

    case 'error':
      statusPill.classList.add('danger');
      label = 'Status: Error';
      subtitle = 'Vinti has encountered an Error.';
      break;

    default:
      statusPill.classList.add('neutral');
      label = 'Status: Unknown';
      subtitle = 'Vinti status is unknown.';
      break;
  }

  statusPill.textContent = label;

  if (subtitleText) {
    subtitleText.textContent = subtitle;
  }
}


async function syncStatusFromStatusCentre() {
  try {
    const res = await fetch('https://backuppass.github.io/Status-Centre/');
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tagline = doc.querySelector('.status-row .tagline') || doc.querySelector('.tagline');
    if (!tagline) {
      applyStatus('unknown');
      return;
    }

    const text = tagline.textContent || '';

    const match = text.match(/This app is\s+([A-Za-z]+)/i);
    const statusWord = match ? match[1] : 'unknown';

    applyStatus(statusWord);

    if (reasonPill) {
      reasonPill.textContent = text.trim();
    }
  } catch (err) {
    console.error('Failed to sync status from Status Centre:', err);
    applyStatus('unknown');
    if (reasonPill) {
      reasonPill.textContent = 'Reason: Unable to fetch status.';
    }
  }

  updateLastCheck();
}

if (retryBtn && card) {
  retryBtn.addEventListener('click', () => {
    card.classList.remove('pulse');
    void card.offsetWidth;
    card.classList.add('pulse');
    updateLastCheck();

    setTimeout(() => {
      location.reload();
    }, 350);
  });
}

syncStatusFromStatusCentre();

setInterval(() => {
  location.reload();
}, 60000);
