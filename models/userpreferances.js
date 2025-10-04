// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Userpreferance extends Model {
    static associate(models) {
    //   User.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'id' ,as:'role' });
    //   User.belongsTo(models.CallCenter, { foreignKey: 'call_center_id', targetKey: 'id' });
    //   User.hasMany(models.Formsdata, { foreignKey: 'member_id' });
    //   User.hasMany(models.MissionMembers, { foreignKey: 'member_id' ,as:'User'});
    }
  }

  Userpreferance.init(
    {
      user_id: DataTypes.BIGINT,
      ethnicity: DataTypes.STRING,
      spice_preference: DataTypes.ENUM('Low', 'Medium', 'High'),
      dietary_restrictions:DataTypes.TEXT,
      favorite_cuisines:DataTypes.TEXT,
      income:DataTypes.ENUM('Low', 'Medium', 'High'),
      timeseatout:DataTypes.BOOLEAN,
     timesorderin:DataTypes.BOOLEAN,
     timescook:DataTypes.BOOLEAN,
  
    },
    {
      sequelize,
      tableName: 'user_preferences',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Userpreferance',
    }
  );

  return Userpreferance;
};
