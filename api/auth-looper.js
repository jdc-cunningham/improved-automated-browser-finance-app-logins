const { getAuthCodeFromDb } = require('./methods');

const checkForAuthCode = async (callCount, accountPrefix, topResolve) => { // lol wut
  callCount += 1;

  if (callCount === 119) {
    resolve(false); // last attempt
    return;
  }

  const authCode = await getAuthCodeFromDb(accountPrefix);

  if (authCode?.authCode) {
    topResolve(authCode.authCode);
  } else {
    // keep trying
    setTimeout(() => {
      checkForAuthCode(callCount, accountPrefix, topResolve);
    }, 5000);
  }
};

const getAuthCode = async (attempts, accountPrefix) => {
  return new Promise(resolve => {
    checkForAuthCode(attempts, accountPrefix, resolve);
  });
};

module.exports = {
  getAuthCode
};
