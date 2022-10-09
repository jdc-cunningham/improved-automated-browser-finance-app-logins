const checkMark = '\u2713';
const reload = '&#x21bb;';
const accountSyncStatus = document.getElementById('account-sync-status');

// get accounts from db
// note auth codes are not a 1:1 map, some accounts may not have 2FA
getAjax('http://localhost:5042/get-accounts', res => {
  const data = JSON.parse(res);

  if (data?.accounts.length) {
    document.getElementById('account-sync-status').innerText = data.accounts.map(val => val).join('\n');
  }
});
