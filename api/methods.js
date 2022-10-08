const { pool } = require('./database/db_connect');
const { trimTimestamp } = require('./utils');

const getAuthCodeFromDb = async (accountPrefix) => {
  return new Promise(resolve => {
    pool.query(
      `SELECT auth_code, updated_at FROM auth_codes WHERE account_prefix = ?`,
      [accountPrefix], // eg. bofa
      (err, qres) => {
        if (err) {
          resolve({err: true});
        } else {
          if (qres.length) {
            // validate if within 10 minute limit in case old/still waiting
            const now = trimTimestamp(Date.now());

            console.log(`${now} vs ${qres[0].updated_at}`);

            if ((now - 120) < qres[0].updated_at) { // 2 minute min elapsed time check
              resolve({err: false, authCode: qres[0].auth_code});
            } else {
              resolve({err: false});
            }
          } else {
            resolve({err: false});
          }
        }
      }
    );
  });
}

const _getAccount = async (accountPrefix) => {
  return new Promise((resolve) => {
    pool.query(
      `SELECT id FROM auth_codes WHERE account_prefix = ?`,
      [accountPrefix],
      (err, qres) => {
        if (err) {
          resolve({err: true});
        } else {
          if (qres.length) {
            resolve({err: false, exists: true});
          } else {
            resolve({err: false, exists: false});
          }
        }
      }
    );
  });
}

// no validation, want only one entry
// check exists if not write or update
const addAuthCode = async (req, res) => {
  const accountPrefix = req.body.accountPrefix;
  const authCode = req.body.authCode;
  const timestamp = trimTimestamp(Date.now());
  const account = await _getAccount(accountPrefix);

  if (account?.exists) {
    pool.query(
      `UPDATE auth_codes SET auth_code = ?, updated_at = ? WHERE account_prefix = ?`,
      [authCode, timestamp, accountPrefix],
      (err, qres) => {
        if (err) {
          res.status(400).json({err: true});
        } else {
          res.status(200).json({err: false});
        }
      }
    );
  } else {
    pool.query(
      `INSERT INTO auth_codes SET account_prefix = ?, auth_code = ?, updated_at = ?`,
      [accountPrefix, authCode, timestamp ],
      (err, qres) => {
        if (err) {
          res.status(400).json({err: true});
        } else {
          res.status(200).json({err: false});
        }
      }
    ); 
  }
}

const getAccountPrefixes = async (req, res) => {
  pool.query(
    `SELECT account_prefix FROM auth_codes WHERE id > 0`,
    (err, qres) => {
      if (err) {
        res.status(400).json({err: true});
      } else {
        if (qres.length) {
          res.status(200).json({err: false, accountPrefixes: qres.map(row => row.account_prefix)});
        } else {
          res.status(200).json({err: false, accountPrefixes: []});
        }
      }
    }
  );
}

module.exports = {
  getAuthCodeFromDb,
  addAuthCode,
  getAccountPrefixes
};