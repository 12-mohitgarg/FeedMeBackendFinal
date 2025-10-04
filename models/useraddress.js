// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class  Useraddress extends Model {
    static associate(models) {

    }
  }

  Useraddress.init(
    {
      user_id:DataTypes.INTEGER,
      type :DataTypes.ENUM('Home',"Work","Other"),
      address:DataTypes.INTEGER,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      

    },
    {
      sequelize,
      tableName: 'user_address',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Useraddress',
    }
  );

  return Useraddress;
};
