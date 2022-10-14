const { getAccountsToSync } = require('./methods');
const { processAccount } = require('./account_processor');
const { writeToSheet } = require('../google-spreadsheet-api/writeToSpreadsheet');
const { getDateTime } = require('./utils');

const getColIndex = (letter) => (
  `ABCDEFGHIJKLMNOPQRSTUVWXYZ`.indexOf(letter.toUpperCase())
);

const runSync = async (req, res) => {
  const skipAccounts = process.env.skip_accounts.split(',');
  const accountsToSync = await getAccountsToSync();
  const promises = [];

  // console.log(accountsToSync);

  accountsToSync.accounts.forEach(account => {
    if (skipAccounts.indexOf(account.name) === -1) {
      promises.push(processAccount(JSON.parse(account.interactions)));
    }
  });

  Promise.all(promises).then(res => {
    const accounts = res; // array of {accountName: #, balance: #}
    console.log(accounts);

    const rowVals = [];

    accounts.forEach(account => {
      if (account?.balances) { // multitarget
        account.balances.forEach(balance => {
          rowVals[getColIndex(balance.column)] = balance.balance.split('$')[1]
        });
      } else {
        rowVals[getColIndex(account.column)] = account.balance.split('$')[1]
      }
    });

    // const rowVals = [
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '',
    //   '', // tmp till batch write done
    //   accounts[0].balance.split('$')[1]
    // ];

    writeToSheet(rowVals);
  });
}

module.exports = {
  runSync
}