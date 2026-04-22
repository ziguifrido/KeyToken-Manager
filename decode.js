var browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

function formatValue(key, value) {
  var tsFields = ['exp', 'iat', 'nbf', 'auth_time'];
  if (tsFields.indexOf(key) !== -1 && typeof value === 'number') {
    var date = new Date(value * 1000);
    return { text: date.toLocaleString('pt-BR') + ' (' + value + ')', cls: 'timestamp' };
  }
  if (typeof value === 'boolean') return { text: String(value), cls: 'boolean' };
  if (typeof value === 'number')  return { text: String(value), cls: 'number' };
  if (typeof value === 'object')  return { text: JSON.stringify(value, null, 2), cls: '' };
  return { text: String(value), cls: '' };
}

browserAPI.storage.local.get(['_jwt_decode_payload'], function (result) {
  document.getElementById('loading').style.display = 'none';

  if (!result._jwt_decode_payload) {
    var err = document.getElementById('error-msg');
    err.style.display = 'block';
    err.textContent = '❌ Nenhum payload encontrado. Abra esta página através da extensão.';
    return;
  }

  try {
    var payload = JSON.parse(result._jwt_decode_payload);
    var grid    = document.getElementById('fields-grid');

    Object.keys(payload).forEach(function (key) {
      var value = payload[key];
      var fmt   = formatValue(key, value);

      var card   = document.createElement('div');
      card.className = 'field-card';

      var keyEl  = document.createElement('div');
      keyEl.className   = 'field-key';
      keyEl.textContent = key;

      var valEl  = document.createElement('div');
      valEl.className   = 'field-value ' + fmt.cls;
      valEl.textContent = fmt.text;

      card.appendChild(keyEl);
      card.appendChild(valEl);
      grid.appendChild(card);
    });

    document.getElementById('raw-pre').textContent = result._jwt_decode_payload;
    document.getElementById('content').style.display = 'block';

    // Clean up
    browserAPI.storage.local.remove('_jwt_decode_payload');
  } catch (e) {
    var errEl = document.getElementById('error-msg');
    errEl.style.display = 'block';
    errEl.textContent   = '❌ Erro ao processar payload: ' + e.message;
  }
});

document.getElementById('raw-toggle').addEventListener('click', function () {
  document.getElementById('raw-toggle').classList.toggle('open');
  document.getElementById('raw-pre').classList.toggle('open');
});
