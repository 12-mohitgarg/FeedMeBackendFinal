'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const mysql2 = require('mysql2');   // 👉 explicitly import mysql2
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

console.log(process.env.DB_DEV_DATABASE); // Debug: Check if password is loaded

const sequelize = new Sequelize(
  process.env.DB_DEV_DATABASE,
  process.env.DB_DEV_USERNAME,
  process.env.DB_DEV_PASSWORD,
  {
    host: process.env.DB_DEV_HOST,
    dialect: process.env.DB_DEV_DIALECT,
    port: 3307,
    timezone: process.env.DB_DEV_TIMEZONE,
    logging: false,
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Load all model files dynamically
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ✅ Automatically create tables if not exist
sequelize
  .sync()
  .then(() => console.log("✅ All models synchronized successfully!"))
  .catch(err => console.error("❌ Error syncing models:", err.message));

module.exports = db;
