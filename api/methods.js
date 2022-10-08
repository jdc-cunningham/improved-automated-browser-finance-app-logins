const { pool } = require('./database/db_connect');
const { trimTimestamp } = require('./utils');

const getAuthCode = async (req, res) => {
  const accountPrefix = req.query.account_prefix;

  return new Promise(resolve => {
    pool.query(
      `SELECT auth_code, updated_at FROM auth_codes WHERE account_prefix = ?`,
      [accountPrefix], // eg. bofa
      (err, qres) => {
        if (err) {
          res.status(400).json({err: true});
        } else {
          if (qres.length) {
            // validate if within 10 minute limit in case old/still waiting
            const now = trimTimestamp(Date.now());

            if (qres[0].updated_at < now + 600) {
              res.status(200).json({err: false, authCode: qres[0].auth_code});
            } else {
              res.status(200).json({err: false});
            }
          } else {
            res.status(200).json({err: false});
          }
        }
      }
    );
  });
}

module.exports = {
  getAuthCode
};