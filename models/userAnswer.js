// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class  Useranswer extends Model {
    static associate(models) {

    }
  }

  Useranswer.init(
    {
      user_id:DataTypes.INTEGER,
      answer :DataTypes.JSON,
      

    },
    {
      sequelize,
      tableName: 'user_answer',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Useranswer',
    }
  );

  return Useranswer;
};
