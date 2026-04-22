// Chrome / Firefox compatibility shim
// Firefox exposes `browser` (Promise-based); Chrome exposes `chrome` (callback-based)
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

// State
let tokenData   = null;
let timerInterval = null;
let expiresAt   = null;
let totalSeconds  = 0;

// Elements
const statusDot     = document.getElementById('status-dot');
const btnFetch      = document.getElementById('btn-fetch');
const errorBox      = document.getElementById('error-box');
const tokenSection  = document.getElementById('token-section');
const tokenValueEl  = document.getElementById('token-value');
const tokenBadge    = document.getElementById('token-badge');
const tokenTypeEl   = document.getElementById('token-type');
const tokenExpiresEl = document.getElementById('token-expires');
const tokenTimeEl   = document.getElementById('token-time');
const progressBar   = document.getElementById('progress-bar');
const timerRemaining = document.getElementById('timer-remaining');
const configToggle  = document.getElementById('config-toggle');
const configSection = document.getElementById('config-section');
const togglePass    = document.getElementById('toggle-pass');

// ── Config toggle ─────────────────────────────────────────────
configToggle.addEventListener('click', function () {
  configToggle.classList.toggle('open');
  configSection.classList.toggle('open');
});

// ── Password visibility toggle ────────────────────────────────
togglePass.addEventListener('click', function () {
  var passInput = document.getElementById('password');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    togglePass.textContent = '🙈';
  } else {
    passInput.type = 'password';
    togglePass.textContent = '👁';
  }
});

// ── Load saved credentials ────────────────────────────────────
browserAPI.storage.local.get(
  ['username', 'password', 'remember_password', 'client_id', 'token_url', 'last_token_data'],
  function (result) {
    if (result.username)   document.getElementById('username').value   = result.username;
    if (result.client_id)  document.getElementById('client-id').value  = result.client_id;
    if (result.token_url)  document.getElementById('token-url').value  = result.token_url;

    var rememberCheckbox = document.getElementById('remember-password');
    if (result.remember_password) {
      rememberCheckbox.checked = true;
      if (result.password) document.getElementById('password').value = result.password;
    }

    // Restore last token if still valid
    if (result.last_token_data) {
      var saved = result.last_token_data;
      if (saved.expiresAt > Date.now()) {
        displayToken(saved.accessToken, saved.expiresIn, saved.tokenType, saved.obtainedAt, saved.expiresAt);
      }
    }
  }
);

// ── Fetch token ───────────────────────────────────────────────
btnFetch.addEventListener('click', fetchToken);
document.getElementById('password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') fetchToken();
});

async function fetchToken() {
  var username  = document.getElementById('username').value.trim();
  var password  = document.getElementById('password').value;
  var clientId  = document.getElementById('client-id').value.trim();
  var tokenUrl  = document.getElementById('token-url').value.trim();

  if (!username || !password) {
    showError('Preencha usuário e senha.');
    return;
  }

  // Persist credentials
  var rememberPassword = document.getElementById('remember-password').checked;
  var saveData = {
    username: username,
    client_id: clientId,
    token_url: tokenUrl,
    remember_password: rememberPassword,
    password: rememberPassword ? password : ''
  };
  browserAPI.storage.local.set(saveData);

  setStatus('loading');
  btnFetch.disabled = true;
  btnFetch.textContent = '⏳ OBTENDO TOKEN...';
  hideError();
  clearTimer();

  try {
    var body = new URLSearchParams({
      grant_type: 'password',
      client_id:  clientId,
      username:   username,
      password:   password
    });

    var response = await fetch(tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString()
    });

    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.error || ('HTTP ' + response.status));
    }

    if (!data.access_token) {
      throw new Error('Resposta inválida: access_token ausente.');
    }

    var obtainedAt  = Date.now();
    var expiresIn   = data.expires_in || 300;
    var expiresAtMs = obtainedAt + expiresIn * 1000;

    browserAPI.storage.local.set({
      last_token_data: {
        accessToken: data.access_token,
        expiresIn:   expiresIn,
        tokenType:   data.token_type || 'Bearer',
        obtainedAt:  obtainedAt,
        expiresAt:   expiresAtMs
      }
    });

    displayToken(data.access_token, expiresIn, data.token_type || 'Bearer', obtainedAt, expiresAtMs);
    setStatus('active');

  } catch (err) {
    showError('❌ ' + err.message);
    setStatus('error');
  } finally {
    btnFetch.disabled = false;
    btnFetch.textContent = '⚡ OBTER ACCESS TOKEN';
  }
}

// ── Display token ─────────────────────────────────────────────
function displayToken(token, expiresIn, type, obtainedAt, expiresAtMs) {
  tokenData    = token;
  expiresAt    = expiresAtMs;
  totalSeconds = expiresIn || 300;

  tokenValueEl.textContent   = token;
  tokenTypeEl.textContent    = type;
  tokenExpiresEl.textContent = expiresIn + 's';
  tokenTimeEl.textContent    = new Date(obtainedAt).toLocaleTimeString('pt-BR');

  tokenSection.classList.add('visible');
  tokenBadge.textContent  = 'ATIVO';
  tokenBadge.className    = 'badge success';

  startTimer();
  setStatus('active');
}

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
  clearTimer();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function clearTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function updateTimer() {
  var remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  var pct       = Math.max(0, (remaining / totalSeconds) * 100);

  if (remaining <= 0) {
    timerRemaining.textContent   = 'EXPIRADO';
    timerRemaining.style.color   = 'var(--danger)';
    progressBar.style.width      = '0%';
    tokenBadge.textContent       = 'EXPIRADO';
    tokenBadge.className         = 'badge expired';
    setStatus('error');
    clearTimer();
    return;
  }

  var mins = Math.floor(remaining / 60);
  var secs = remaining % 60;
  timerRemaining.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
  timerRemaining.style.color = remaining < 60 ? 'var(--warning)' : 'var(--success)';
  progressBar.style.width    = pct + '%';
  progressBar.className      = 'progress-bar' + (pct < 20 ? ' warning' : '');
}

// ── Copy token ────────────────────────────────────────────────
document.getElementById('btn-copy').addEventListener('click', function () {
  if (!tokenData) return;
  var btn = document.getElementById('btn-copy');

  function onSuccess() {
    btn.textContent = '✅ COPIADO!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = '📋 COPIAR TOKEN';
      btn.classList.remove('copied');
    }, 2000);
  }

  function fallbackCopy() {
    var ta = document.createElement('textarea');
    ta.value = tokenData;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      showError('Falha ao copiar: ' + e.message);
    }
    document.body.removeChild(ta);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tokenData).then(onSuccess).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
});

// ── Decode JWT ────────────────────────────────────────────────
document.getElementById('btn-decode').addEventListener('click', function () {
  if (!tokenData) return;
  try {
    var parts = tokenData.split('.');
    if (parts.length !== 3) throw new Error('Não é um JWT');
    var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Store payload, then open decode.html (works in both Chrome and Firefox)
    browserAPI.storage.local.set(
      { _jwt_decode_payload: JSON.stringify(payload, null, 2) },
      function () {
        browserAPI.tabs.create({ url: browserAPI.runtime.getURL('decode.html') });
      }
    );
  } catch (e) {
    showError('Não foi possível decodificar: ' + e.message);
  }
});

// ── Helpers ───────────────────────────────────────────────────
function setStatus(state) {
  statusDot.className = 'status-dot' + (state !== 'idle' ? ' ' + state : '');
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('visible');
  tokenSection.classList.remove('visible');
}

function hideError() {
  errorBox.classList.remove('visible');
}
