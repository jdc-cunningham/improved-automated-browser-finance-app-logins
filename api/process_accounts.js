// for testing
const fs = require('fs');
const { processAccount } = require('./account_processor');

const sampleJson = JSON.parse(fs.readFileSync('test-account.json', 'utf8')); // https://stackoverflow.com/a/10011078/2710227

const runSync = async () => {
  console.log(await processAccount(sampleJson));
};

runSync();