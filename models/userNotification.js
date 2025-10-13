// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usernotification extends Model {
    static associate(models) {
    //   User.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'id' ,as:'role' });
    //   User.belongsTo(models.CallCenter, { foreignKey: 'call_center_id', targetKey: 'id' });
    //   User.hasMany(models.Formsdata, { foreignKey: 'member_id' });
    //   User.hasMany(models.MissionMembers, { foreignKey: 'member_id' ,as:'User'});
    Usernotification.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id' });
    }
  }

  Usernotification.init(
    {
 user_id:DataTypes.INTEGER,
      restaurant_id :DataTypes.INTEGER,
     
       title:DataTypes.STRING,
       body:DataTypes.STRING,
       is_seen:DataTypes.INTEGER
    },
    {
      sequelize,
      tableName: 'user_notification',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Usernotification',
    }
  );

  return Usernotification;
};
