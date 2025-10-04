const { StatusCode, Status } = require("../constant/HttpConstant");

const { validationResult } = require("express-validator");
const models = require("../../models");
const jwt = require("jsonwebtoken");
const axios = require('axios')
require("dotenv").config();
const bcrypt = require('bcryptjs');
const sendOtpOnMobile = require("../../utils/sendSms");
const sendEmail = require("../../utils/sendMail");


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


async function addrestaurant(req, res) {
  try {
 
const {id , google_place_id, name,address,latitude,longitude,price_level,total_reviews,google_rating,cuisine,times_recommended,times_upvoted,times_regular_box_checked,times_downvoted,total_times_reviewed_in_app} = req.body
    const file = req.files?.file?.[0];
    console.log('====================================');
    console.log(file);
    console.log('====================================');

if(id){
    const rest = await models.Restaurant.findOne({
        where:{
            id
        }
    })

    if(!rest){
        return res.status(404).json({
            success:false,
            message:'Resturant Not Found'
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
        success:false,
        message:"Restuant Updated Successfully",
        data:rest
    })
}
console.log('====================================');
console.log("ddd");
console.log('====================================');

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
      image_url:file.path ? file.path : null
})
console.log('====================================');
console.log(resto);
console.log('====================================');
   
 return res.status(200).json({
        success:true,
        message:"Restaurant Successfully",
        data:resto
   
       
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
 
    
      const { latitude, longitude, radius = 1200, keyword = "restaurant" } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    // Call Google Places API
    const apiKey = process.env.GOOGLE_API_KEY; // store in .env
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;

    const response = await axios.get(url);
    const places = response.data.results || [];

console.log(response.data);

    const nearbyRestaurants = [];
    for (let place of places) {
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
          cuisine: keyword,
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

console.log(restaurant,created);

      if (!created) {
        await restaurant.update({
          total_reviews: place.user_ratings_total || restaurant.total_reviews,
          google_rating: place.rating || restaurant.google_rating,
        });
      }

      nearbyRestaurants.push(restaurant);
    }

    return res.status(200).json({
      success: true,
      message: "Restaurants fetched successfully",
      data: nearbyRestaurants,
    });
    
    
   

  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}



async function addinteractionhistory(req, res) {
  try {
 

    const user_id = req.apiAuth.user_id
    const {id , restaurant_id , status} = req.body
console.log('====================================');
console.log(status);
console.log('====================================');
    if(!restaurant_id || !status){
        return res.status(400).json({
            success:false,
            message:"please fill all the details"
        })
    }
 
    const user = await models.User.findOne({
        where:{
            id: user_id
        }
    })
    const resto = await models.Restaurant.findOne({
        where:{
            id: restaurant_id
        }
    })

    if(!user){
          return res.status(400).json({
            success:false,
            message:"User Not Found"
        })
    }
    if(!resto){
          return res.status(400).json({
            success:false,
            message:"Restauarant Not Found"
        })
    }


    if(id){
     const kk =   await  models.Interactionhistory.findOne({
      where:{
        id
      }
    }) 

    if(!kk){
        return res. status(404).json({
            success:false,
            message:"Action not found"
        })
    }


    kk.user_id = user_id || kk.user_id,
        kk.restaurant_id = restaurant_id || kk.restaurant_id,
        kk.action = status || kk.action
        await kk.save()

         return res.status(200).json({
        success:true,
        message:'action Update Successfully',
      
    })

    }

    await  models.Interactionhistory.create({
        user_id,
        restaurant_id,
        action:status
    })


    return res.status(200).json({
        success:true,
        message:'action add Successfully',
      
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
  const { status} = req.body

    if( !status){
        return res.status(400).json({
            success:false,
            message:"please fill all the details"
        })
    }
 
     const user = await models.User.findOne({
        where:{
            id: user_id
        }
    })

    
    if(!user){
          return res.status(400).json({
            success:false,
            message:"User Not Found"
        })
    }

console.log(user_id, status);


   const data = await models.Interactionhistory.findAll({
  where: {
    user_id,
    action: status,
  },
  include:[
    {
         model: models.Restaurant, 
        
    }
  ],
  order: [["created_at", "DESC"]], // latest first
});


    return res.status(200).json({
        success:true,
        message:'Action Get Successfully',
        data:data
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
 
      
  const { id} = req.body

    if( !id){
        return res.status(400).json({
            success:false,
            message:"please fill all the details"
        })
    }
 



   const data = await models.Interactionhistory.destroy(
    {where:{
        id:id
    }}
   );


    return res.status(200).json({
        success:true,
        message:'Action Delete Successfully',
   
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
addrestaurant:addrestaurant,
getrestaurent:getrestaurent,
addinteractionhistory:addinteractionhistory,
getinteractionhistory:getinteractionhistory,
deleteinteractionhistory:deleteinteractionhistory
};
