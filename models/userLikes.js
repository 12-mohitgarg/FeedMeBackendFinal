// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Userlikes extends Model {
    static associate(models) {
    //   User.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'id' ,as:'role' });
    //   User.belongsTo(models.CallCenter, { foreignKey: 'call_center_id', targetKey: 'id' });
    //   User.hasMany(models.Formsdata, { foreignKey: 'member_id' });
    //   User.hasMany(models.MissionMembers, { foreignKey: 'member_id' ,as:'User'});
    Userlikes.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id' });
    }
  }

  Userlikes.init(
    {
 user_id:DataTypes.INTEGER,
      restaurant_id :DataTypes.INTEGER,
     
       like_status: DataTypes.INTEGER,
    fav_status: DataTypes.INTEGER,
    regular_status: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: 'user_likes',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Userlikes',
    }
  );

  return Userlikes;
};
