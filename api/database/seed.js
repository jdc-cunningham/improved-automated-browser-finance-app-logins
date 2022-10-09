require('dotenv').config({
  path: __dirname + '/../.env'
});

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

// connect to mysql, assumes above works eg. mysql is running/credentials exist
connection.connect((err) => {
  if (err) {
      console.error('error connecting: ' + err.stack);
      return;
  }
});

// check if database exists, if not create it
connection.query('CREATE DATABASE IF NOT EXISTS `browser_finance_automation`', (error, results, fields) => {
  if (error) {
      console.log('error checking if browser_finance_automation database exists:', error.sqlMessage);
      return;
  }
});

// use the database
connection.query('USE browser_finance_automation', (error, results, fields) => {
  if (error) {
      console.log('an error occurred trying to use the browser_finance_automation database', error);
      return;
  }
});

// build the various tables and their schemas

// auth codes
connection.query(
  'CREATE TABLE `auth_codes` (' +
      '`id` int(11) NOT NULL AUTO_INCREMENT,' +
      '`account_prefix` varchar(255) COLLATE utf8_unicode_ci NOT NULL,' +
      '`auth_code` int(6),' +
      '`updated_at` int(10),' +
      'PRIMARY KEY (`id`)' +
     ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci',
  (error, results, fields) => {
      if (error) {
          console.log('error creating table auth_codes:', error.sqlMessage);
          return;
      }
  }
)

// accounts - where JSON interaction steps are stored
connection.query(
  'CREATE TABLE `accounts` (' +
      '`id` int(11) NOT NULL AUTO_INCREMENT,' +
      '`account_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,' +
      '`interaction_json` longtext,' +
      '`created_at` datetime,' +
      '`updated_at` datetime,' +
      'PRIMARY KEY (`id`)' +
     ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci',
  (error, results, fields) => {
      if (error) {
          console.log('error creating table accounts:', error.sqlMessage);
          return;
      }
  }
)

connection.end();