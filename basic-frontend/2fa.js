const localApiUrl = 'http://localhost:5042/add-auth-code';

getAjax('http://localhost:5042/get-account-prefixes', res => {
  const data = JSON.parse(res);

  if (data?.accountPrefixes.length) {
    document.getElementById('prefix-list').innerText = 'Existing accounts:' + '\n\n' + data.accountPrefixes.map(val => val).join('\n');
  }
});

const addBtn = document.getElementById('add-auth-code');

addBtn.addEventListener('click', () => {
  // verify not empty
  const accountInput = document.getElementById('account-prefix');
  const authCodeInput = document.getElementById('auth-code');

  if (!accountInput.value.length || !authCodeInput.value.length) {
    alert('Please make sure both fields are filled in.');
    return;
  }

  postAjax(
    localApiUrl,
    {
      accountPrefix: accountInput.value,
      authCode: authCodeInput.value
    },
    (res) => {
      console.log(res);
    }
  );
});