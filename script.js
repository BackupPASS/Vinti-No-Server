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

    let statusWord = 'unknown';
    let reasonText = '';

    const vintiCard = Array.from(doc.querySelectorAll('.card')).find(card => {
      const title = card.querySelector('h2');
      return title && title.textContent.trim().toLowerCase() === 'vinti';
    });

    if (vintiCard) {
      const windowsRow = Array.from(vintiCard.querySelectorAll('.status-row')).find(row => {
        const osHeading = row.querySelector('h3');
        return osHeading && osHeading.textContent.trim().toLowerCase() === 'windows';
      });

      if (windowsRow) {
        const statusPillEl = windowsRow.querySelector('.pill');
        if (statusPillEl) {
          statusWord = statusPillEl.textContent.trim();
        }

        const taglineEl = windowsRow.querySelector('.tagline');
        if (taglineEl) {
          reasonText = taglineEl.textContent.trim();
        }
      }
    }

    applyStatus(statusWord);

    if (reasonPill) {
      if (reasonText) {
        reasonPill.textContent = reasonText;
      } else {
        reasonPill.textContent = 'Reason: Unable to determine status reason.';
      }
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
    void card.offsetWidth; // force reflow
    card.classList.add('pulse');

    setTimeout(() => {
      syncStatusFromStatusCentre();
    }, 350);
  });
}

syncStatusFromStatusCentre();

setInterval(() => {
  syncStatusFromStatusCentre();
}, 30000);
