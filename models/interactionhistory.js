// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interactionhistory extends Model {
    static associate(models) {
    //   User.belongsTo(models.Role, { foreignKey: 'role_id', targetKey: 'id' ,as:'role' });
    //   User.belongsTo(models.CallCenter, { foreignKey: 'call_center_id', targetKey: 'id' });
    //   User.hasMany(models.Formsdata, { foreignKey: 'member_id' });
Interactionhistory.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id' });

    }
  }

  Interactionhistory.init(
    {
      user_id:DataTypes.INTEGER,
      restaurant_id :DataTypes.INTEGER,
      action :DataTypes.INTEGER,

    },
    {
      sequelize,
      tableName: 'interaction_history',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Interactionhistory',
    }
  );

  return Interactionhistory;
};
