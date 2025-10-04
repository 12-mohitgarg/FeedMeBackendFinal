require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_DATABASE,
    host: process.env.DB_DEV_HOST,
    dialect: process.env.DB_DEV_DIALECT,
    logging: process.env.DB_DEV_LOGGING === 'true',
    timezone: process.env.DB_DEV_TIMEZONE,
  },
  test: {
    username: process.env.DB_TEST_USERNAME,
    password: process.env.DB_TEST_PASSWORD === 'null' ? null : process.env.DB_TEST_PASSWORD,
    database: process.env.DB_TEST_DATABASE,
    host: process.env.DB_TEST_HOST,
    dialect: process.env.DB_TEST_DIALECT,
  },
  production: {
    username: process.env.DB_DEV_USERNAME,
   password: process.env.DB_DEV_PASSWORD,
   database: process.env.DB_DEV_DATABASE,
   host: process.env.DB_DEV_HOST,
   dialect: process.env.DB_DEV_DIALECT,
   logging: process.env.DB_DEV_LOGGING === 'true',
   timezone: process.env.DB_DEV_TIMEZONE,
 },
};

module.exports = config;
