// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
       }
  }

  Restaurant.init(
    {
      google_place_id: DataTypes.STRING,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      price_level:DataTypes.INTEGER,
      total_reviews:DataTypes.INTEGER,
      google_rating: DataTypes.FLOAT,
      cuisine: DataTypes.TEXT,
      	image_url: DataTypes.TEXT,
times_recommended:DataTypes.INTEGER,
times_upvoted:DataTypes.INTEGER,
times_regular_box_checked:DataTypes.INTEGER,
	times_downvoted:DataTypes.INTEGER,
total_times_reviewed_in_app:DataTypes.INTEGER,
     
    },
    {
      sequelize,
      tableName: 'restaurants',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      modelName: 'Restaurant',
    }
  );

  return Restaurant;
};
