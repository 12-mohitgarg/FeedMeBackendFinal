// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      //   User.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'id' ,as:'role' });
      //   User.belongsTo(models.CallCenter, { foreignKey: 'call_center_id', targetKey: 'id' });
      //   User.hasMany(models.Formsdata, { foreignKey: 'member_id' });
      //   User.hasMany(models.MissionMembers, { foreignKey: 'member_id' ,as:'User'});
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      password: DataTypes.STRING,
      auth_provider: DataTypes.ENUM('Gmail', 'Mobile OTP'),
      income: DataTypes.ENUM('Low', 'Middle', 'High'),
      age: DataTypes.INTEGER,
      ethnicity: DataTypes.STRING,
      gender: DataTypes.ENUM('Male', 'Female', 'Other'),
      otp: DataTypes.STRING,
      fcm_token: DataTypes.STRING,
      is_new_user: DataTypes.BOOLEAN,
      is_verified: DataTypes.BOOLEAN,
      otp_expiry: DataTypes.DATE,
      image: DataTypes.STRING,
      is_questions_verified:DataTypes.BOOLEAN
    },
    {
      sequelize,
      tableName: 'users',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'User',
    }
  );

  return User;
};
