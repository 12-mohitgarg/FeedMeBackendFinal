const { StatusCode, Status } = require("../constant/HttpConstant");

const { validationResult } = require("express-validator");
const models = require("../../models");
const jwt = require("jsonwebtoken");
const axios = require('axios')
require("dotenv").config();
const bcrypt = require('bcryptjs');
const sendOtpOnMobile = require("../../utils/sendSms");
const sendEmail = require("../../utils/sendMail");
const sendNotification = require("../../utils/sendNotification");
const { Op, Sequelize, where } = require('sequelize');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

async function addrestaurant(req, res) {
  try {

    const { id, google_place_id, name, address, latitude, longitude, price_level, total_reviews, google_rating, cuisine, times_recommended, times_upvoted, times_regular_box_checked, times_downvoted, total_times_reviewed_in_app } = req.body
    const file = req.files?.file?.[0];


    if (id) {
      const rest = await models.Restaurant.findOne({
        where: {
          id
        }
      })

      if (!rest) {
        return res.status(404).json({
          success: false,
          message: 'Resturant Not Found'
        })
      }

      rest.google_place_id = google_place_id || rest.google_place_id
      rest.name = name || rest.name
      rest.address = address || rest.address
      rest.latitude = latitude || rest.latitude
      rest.longitude = longitude || rest.longitude
      rest.price_level = price_level || rest.price_level
      rest.total_reviews = total_reviews || rest.total_reviews
      rest.google_rating = google_rating || rest.google_rating
      rest.cuisine = cuisine || rest.cuisine
      rest.image_url = file ? file.path : rest.image_url
      rest.times_recommended = times_recommended || rest.times_recommended
      rest.times_upvoted = times_upvoted || rest.times_upvoted
      rest.times_regular_box_checked = times_regular_box_checked || rest.times_regular_box_checked
      rest.times_downvoted = times_downvoted || rest.times_downvoted
      rest.total_times_reviewed_in_app = total_times_reviewed_in_app || rest.total_times_reviewed_in_app

      await rest.save()


      return res.status(200).json({
        success: false,
        message: "Restuant Updated Successfully",
        data: rest
      })
    }


    const resto = await models.Restaurant.create({
      google_place_id,
      name,
      address,
      latitude,
      longitude,
      price_level,
      total_reviews,
      google_rating,
      cuisine,
      times_recommended,
      times_upvoted,
      times_regular_box_checked,
      times_downvoted,
      total_times_reviewed_in_app,
      image_url: file.path ? file.path : null
    })


    return res.status(200).json({
      success: true,
      message: "Restaurant Successfully",
      data: resto


    })


  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}



async function getrestaurent(req, res) {
  try {
    const {
      latitude,
      longitude,
      radius = 1200, // meters
      keyword = "restaurant",
      maxDistance = 3, // kilometers
      minRating = 3.5, // minimum Google rating
      maxPrice = 4, // 0 = Free, 4 = Very Expensive
      cuisine = "Indian", // default cuisine type
    } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    // Google Places API
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;

    const response = await axios.get(url);
    const places = response.data.results || [];

    if (!places.length) {
      return res.status(200).json({
        success: true,
        message: "No restaurants found nearby",
        data: [],
      });
    }

    const nearbyRestaurants = [];

    for (let place of places) {

      const distKm = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        place.geometry?.location?.lat,
        place.geometry?.location?.lng
      );

      // Apply filters
      if (
        distKm <= maxDistance &&
        (place.rating || 0) >= minRating &&
        (place.price_level || 0) <= maxPrice
      ) {
        const [restaurant, created] = await models.Restaurant.findOrCreate({
          where: { google_place_id: place.place_id },
          defaults: {
            google_place_id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || "",
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
            price_level: place.price_level || null,
            total_reviews: place.user_ratings_total || 0,
            google_rating: place.rating || 0,
            cuisine,
            image_url: place.photos
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
              : null,
            times_recommended: 0,
            times_upvoted: 0,
            times_regular_box_checked: 0,
            times_downvoted: 0,
            total_times_reviewed_in_app: 0,
          },
        });

        if (!created) {
          await restaurant.update({
            total_reviews:
              place.user_ratings_total || restaurant.total_reviews,
            google_rating: place.rating || restaurant.google_rating,
          });
        }


        restaurant.dataValues.distance_km = distKm.toFixed(2);

        nearbyRestaurants.push(restaurant);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Restaurants fetched successfully",
      filters: { maxDistance, minRating, maxPrice, cuisine },
      count: nearbyRestaurants.length,
      data: nearbyRestaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      data: [],
    });
  }
}







async function addinteractionhistory(req, res) {
  try {


    const user_id = req.apiAuth.user_id
    const { id, restaurant_id, status } = req.body
    console.log('====================================');
    console.log(status);
    console.log('====================================');
    if (!restaurant_id || !status) {
      return res.status(400).json({
        success: false,
        message: "please fill all the details"
      })
    }

    const user = await models.User.findOne({
      where: {
        id: user_id
      }
    })
    const resto = await models.Restaurant.findOne({
      where: {
        id: restaurant_id
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found"
      })
    }
    if (!resto) {
      return res.status(400).json({
        success: false,
        message: "Restauarant Not Found"
      })
    }


    if (id) {
      const kk = await models.Interactionhistory.findOne({
        where: {
          id
        }
      })

      if (!kk) {
        return res.status(404).json({
          success: false,
          message: "Action not found"
        })
      }


      kk.user_id = user_id || kk.user_id,
        kk.restaurant_id = restaurant_id || kk.restaurant_id,
        kk.action = status || kk.action
      await kk.save()

      return res.status(200).json({
        success: true,
        message: 'action Update Successfully',

      })

    }

    const datahh = await models.Interactionhistory.findOne({
      where: {
        user_id,
        restaurant_id,
      }

    })


    if (datahh) {
      datahh.action = status;
      await datahh.save();

      return res.status(200).json({
        success: true,
        message: 'action add Successfully',

      })

    }
    await models.Interactionhistory.create({
      user_id,
      restaurant_id,
      action: status
    })


    return res.status(200).json({
      success: true,
      message: 'action add Successfully',

    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}

async function getinteractionhistory(req, res) {
  try {

    const user_id = req.apiAuth.user_id
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "please fill all the details"
      })
    }

    const user = await models.User.findOne({
      where: {
        id: user_id
      }
    })


    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found"
      })
    }

    console.log(user_id, status);


    const data = await models.Interactionhistory.findAll({
      where: {
        user_id,
        action: status,
      },
      include: [
        {
          model: models.Restaurant,

        }
      ],
      order: [["created_at", "DESC"]], // latest first
    });


    return res.status(200).json({
      success: true,
      message: 'Action Get Successfully',
      data: data
    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}
async function deleteinteractionhistory(req, res) {
  try {


    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "please fill all the details"
      })
    }




    const data = await models.Interactionhistory.destroy(
      {
        where: {
          id: id
        }
      }
    );


    return res.status(200).json({
      success: true,
      message: 'Action Delete Successfully',

    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}

async function sendNotificatio(req, res) {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    // Find unnotified interactions grouped by restaurant and user
    const interactions = await models.Interactionhistory.findAll({
      where: { action: "1", is_notify: 0 },
      attributes: [
        'id',
        'restaurant_id',
        'user_id',
        'created_at'
      ],
      group: ['restaurant_id', 'user_id'],
      subQuery: false,
      raw: true,
      order: [['created_at', 'DESC']]
    });

    if (!interactions || interactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No notifications to send'
      });
    }

    console.log("interactions to notify:", interactions);
    
    for (const interaction of interactions) {
      // Check if user was already notified about this restaurant in the last 4 hours
      const alreadyNotified = await models.Interactionhistory.findOne({
        where: {
          restaurant_id: interaction.restaurant_id,
          user_id: interaction.user_id,
          action: 1,
          is_notify: 1,
          created_at: { [Op.gte]: fourHoursAgo }
        }
      });
console.log("alreadyNotified:", alreadyNotified);

      if (alreadyNotified) continue;

      const user = await models.User.findOne({
        where: { id: interaction.user_id }
      });

      if (!user || !user.fcm_token) continue;

      const tokens = [user.fcm_token];
      const title = 'New Restaurant Action';
      const body = `You have a new action at restaurant ${interaction.restaurant_id}`;
      const data = { interaction };

      // Send notification
      await sendNotification(tokens, title, body, data);

      // Mark as notified
      await models.Interactionhistory.update(
        { is_notify: 1 },
        { where: { id: interaction.id } }
      );

      // Create notification record
      await models.Usernotification.create({
        user_id: interaction.user_id,
        restaurant_id: interaction.restaurant_id,
        title,
        body,
        is_seen: 0
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      count: interactions.length
    });

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: []
    });
  }
}

async function getnotification(req, res) {
  try {


    const user_id = req.apiAuth.user_id






    const data = await models.Usernotification.findAll({
      where: {
        user_id
      },
      include: [
        {
          model: models.Restaurant,

        }
      ],
      order: [["created_at", "DESC"]],
    });


    return res.status(200).json({
      success: true,
      message: 'Notification Data Successfully',
      data: data

    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}


async function addlike(req, res) {
  try {


    const user_id = req.apiAuth.user_id
    const { id, is_liked } = req.body

    if (!id || !is_liked) {
      return res.status(400).json({
        success: false,
        message: "please fill all the details"
      })
    }
    const data = await models.Interactionhistory.findOne({
      where: {
        id,
      }
    })

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'data not found'
      })
    }



    data.is_liked = is_liked
    await data.save()






    return res.status(200).json({
      success: true,
      message: 'like  Data  added Successfully',


    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}


async function likedashboard(req, res) {
  try {


    const user_id = req.apiAuth.user_id


    const data = await models.Interactionhistory.findOne({
      where: {
        is_notify: 1,
        user_id: user_id,
        action: "1",
        is_liked: { [Op.eq]: null }
      },
      include: [
        {
          model: models.Restaurant,

        }
      ], order: [["created_at", "DESC"]],
    });




    return res.status(200).json({
      success: true,
      message: 'like  Data  get Successfully',
      data: data

    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}

async function reviewhistory(req, res) {
  try {


    const user_id = req.apiAuth.user_id
    console.log(user_id);


    const data = await models.Interactionhistory.findAll({
      where: {

        user_id: user_id,
        is_liked: { [Op.ne]: null },
      },
      include: [
        {
          model: models.Restaurant,

        }
      ],
      order: [["created_at", "DESC"]],

    });




    return res.status(200).json({
      success: true,
      message: 'review data get Successfully',
      data: data

    })

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}
module.exports = {
  addrestaurant: addrestaurant,
  getrestaurent: getrestaurent,
  addinteractionhistory: addinteractionhistory,
  getinteractionhistory: getinteractionhistory,
  deleteinteractionhistory: deleteinteractionhistory,
  sendNotificatio: sendNotificatio,
  getnotification: getnotification,
  addlike: addlike,
  likedashboard: likedashboard,
  reviewhistory: reviewhistory
};
