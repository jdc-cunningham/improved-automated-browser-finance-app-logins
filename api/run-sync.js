const { getAccountsToSync } = require('./methods');
const { processAccount } = require('./account_processor');
const { writeToSheet } = require('../google-spreadsheet-api/writeToSpreadsheet');
const { getDateTime } = require('./utils');

const runSync = async (req, res) => {
  const accountsToSync = await getAccountsToSync();
  const promises = [];

  // console.log(accountsToSync);

  accountsToSync.accounts.forEach(account => {
    if (account.name !== 'bofa') {
      promises.push(processAccount(JSON.parse(account.interactions)));
    }
  });

  Promise.all(promises).then(res => {
    const accounts = res; // array of {accountName: #, balance: #}
    console.log(accounts);

    const rowVals = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // tmp till batch write done
      accounts[0].balance.split('$')[1]
    ];

    writeToSheet(rowVals);
  });
}

module.exports = {
  runSync
}