// for testing
const fs = require('fs');
const { processAccount } = require('./account_processor');

const sampleJson = JSON.parse(fs.readFileSync('test-account2.json', 'utf8')); // https://stackoverflow.com/a/10011078/2710227

const runSync = async () => {
  const balance = await processAccount(sampleJson);
  console.log(balance);
};

runSync();