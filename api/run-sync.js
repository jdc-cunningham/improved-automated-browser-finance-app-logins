const { getAccountsToSync } = require('./methods');

const runSync = async (req, res) => {
  const accountsToSync = await getAccountsToSync();
  const promises = [];

  console.log(accountsToSync);

  // accountsToSync.forEach(account => {
  //   promises.push(processAccount(account.interactions));
  // });

  // Promise.all(promises).then(res => {
  //   console.log(res);
  // });
}

module.exports = {
  runSync
}