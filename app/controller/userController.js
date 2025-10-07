const { StatusCode, Status } = require("../constant/HttpConstant");

const { validationResult } = require("express-validator");
const models = require("../../models");
const jwt = require("jsonwebtoken");
const axios = require('axios')
require("dotenv").config();
const bcrypt = require('bcryptjs');
const sendOtpOnMobile = require("../../utils/sendSms");
const sendEmail = require("../../utils/sendMail");
const { EATER_QUESTIONS } = require("../constant/cattleQuestion");

const sendNotification = require("../../utils/sendNotification");


async function login(req, res) {
  try {

    const { email, phone_no, password, fcm_token } = req.body

    if ((!email && !phone_no) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details"
      });
    }


    let userdata

    if (phone_no) {
      userdata = await models.User.findOne({
        where: { phone_number: phone_no },
      })
    } else if (email) {
      userdata = await models.User.findOne({
        where: { email: email },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Some issue Occure"
      })
    }

    if (!userdata ) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }
console.log(userdata.password);

if(userdata.password){
 const checkpass = await bcrypt.compare(password, userdata.password);
  if (!checkpass) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      })
    }
}else{

      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      })
    
}
   

   
   

    userdata.fcm_token = fcm_token ? fcm_token : null
    await userdata.save()
    const token = jwt.sign({ user_id: userdata.id }, process.env.SECRET)

    return res.status(200).json({
      success: true,
      message: "User Login Successfully",
      data: userdata,
      token: token,
      is_new_user: userdata.is_new_user,

    })


  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}


async function signup(req, res) {
  try {

    const { email, phone_no, name } = req.body

    if ((!email && !phone_no) || !name) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details"
      });
    }


    let userdata

    if (phone_no) {
      userdata = await models.User.findOne({
        where: { phone_number: phone_no },
      })
    } else if (email) {
      userdata = await models.User.findOne({
        where: { email: email },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Some issue Occure"
      })
    }
   
    if (userdata) {
      return res.status(401).json({
        success: false,
        message: "User Already exists"
      });
    } 



    const otp = 1234
    const user = await models.User.create({
      name: name,
      email: email ? email : null,
      phone_number: phone_no ? phone_no : null,
      auth_provider: email ? 'Gmail' : 'Mobile OTP',
      otp: otp,
      otp_expiry: new Date(Date.now() + 5 * 60 * 1000)
    })


    if (phone_no) {
      await sendOtpOnMobile(phone_no, otp)
    } else if (email) {
      await sendEmail(email, 'Your One time Password', `<p>${otp}</p>`)
    }





    const token = jwt.sign({ user_id: user.id }, process.env.SECRET)

    return res.status(200).json({
      success: true,
      message: "User Signup Successfully",
      token: token,
      otp: otp,


    })


  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}


async function verifyOtp(req, res) {
  try {
    const id = req.apiAuth.user_id
    const { otp } = req.body;

    const userdata = await models.User.findOne({ where: { id } });


    if (!userdata) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (parseInt(userdata.otp) !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (userdata.otp_expiry && new Date() > userdata.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    userdata.is_verified = true;
    userdata.otp = null;
    await userdata.save();

    const token = jwt.sign({ user_id: userdata.id }, process.env.SECRET);

    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


async function signuppassword(req, res) {
  try {

    const id = req.apiAuth.user_id
    const { password, confirmPassword, fcm_token } = req.body;

    if (password !== confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Passwords do not match"
      });
    }




    const userdata = await models.User.findOne({ where: { id } });
    if (!userdata) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    if (!userdata.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify OTP first"
      });
    }

    const hashpass = await bcrypt.hash(password, 10);
    userdata.password = hashpass;
    userdata.is_new_user = false;
    userdata.fcm_token = fcm_token ? fcm_token : null

    await userdata.save();

    const token = jwt.sign({ user_id: userdata.id }, process.env.SECRET)


    return res.status(200).json({
      success: true,
      message: "User password add  Successfully",
      token: token
    })


  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}

async function forgetpassword(req, res) {
  try {

    const { email, phone_no } = req.body
    if (!email && !phone_no) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone"
      });
    }



    let userdata

    if (phone_no) {
      userdata = await models.User.findOne({
        where: { phone_number: phone_no },
      })
    } else if (email) {
      userdata = await models.User.findOne({
        where: { email: email },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Some issue Occure"
      })
    }

    if (!userdata) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const otp = 1234
    userdata.otp = otp
    userdata.otp_expiry = new Date(Date.now() + 5 * 60 * 1000)
    await userdata.save()
    if (phone_no) {
      await sendOtpOnMobile(phone_no, otp)
    } else if (email) {
      await sendEmail(email, 'Your One time Password', `<p>${otp}</p>`)
    }





    return res.status(200).json({
      success: true,
      message: "otp send  Successfully",
      otp: otp

    })


  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}

async function verifyforgetpassOtp(req, res) {
  try {
    const { email, phone_no, otp } = req.body




    if ((!email && !phone_no) || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details"
      });
    }


    let userdata

    if (phone_no) {
      userdata = await models.User.findOne({
        where: { phone_number: phone_no },
      })
    } else if (email) {
      userdata = await models.User.findOne({
        where: { email: email },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Some issue Occure"
      })
    }

    if (!userdata) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!userdata.otp) {
      return res.status(401).json({
        success: false,
        message: "Please send otp first"
      });
    }




    if (parseInt(userdata.otp) !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (userdata.otp_expiry && new Date() > userdata.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }
    userdata.otp = null;
    await userdata.save();



    const token = jwt.sign({ user_id: userdata.id }, process.env.SECRET)


    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      token: token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function addprofileimage(req, res) {
  try {

    const id = req.apiAuth.user_id

    const file = req.files?.file?.[0];

    if (!file) {
      return res.status(StatusCode.HTTP_BAD_REQUEST).json({
        data: null,
        error: null,
        message: MessageContant.body_empty,
        status_code: StatusCode.HTTP_BAD_REQUEST,
        success: Status.STATUS_FALSE,
        message_code: null,
      });
    }



    const userdata = await models.User.findOne({ where: { id } });
    if (!userdata) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }


    userdata.image = file.path
    await userdata.save()


    return res.status(200).json({
      success: true,
      message: "profile update successfully",
      data: userdata
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function getuser(req, res) {
  try {

    const id = req.apiAuth.user_id

    const userdata = await models.User.findOne({ where: { id } });
    if (!userdata) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User get Successfully",
      data: userdata
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function questions(req, res) {
  try {


    return res.status(200).json({
      success: true,
      data: EATER_QUESTIONS
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
 
async function useranswer(req, res) {
  try {

    const {answer} = req.body
    console.log(req.body);
    
    const user_id = req.apiAuth.user_id

    if(!answer){
      return res.status(400).json({
        success:false,
        message:"fill all details"
      })
    }

const user = await models.User.findOne({
  where:{
    id:user_id
  }
})


if(!user){
  return res.status(404).json({
    success:false,
    message:"User Not Found"
  })
}

const datacheck = await models.Useranswer.findOne({
  where:{
    user_id
  }
})

if(datacheck){
datacheck.answer = answer
await datacheck.save()
}else{
const data = await models.Useranswer.create({
  user_id,answer
})

}


user.is_questions_verified = 1
await user.save()

    return res.status(200).json({
      success: true,
      message:"User answer saved Successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


async function addaddress(req, res) {
  try {
 
       const user_id = req.apiAuth.user_id
        const {id ,lat , lng , address,type} = req.body

        if(!lat || !lng ||  !address || !type) {
          return res.status(400).json({
            success:false,
            message:"Please Fill All Details"
          })

        }


        if(id){
          const addressdata = await models.Useraddress.findOne({
            where:{
              id
            }
          })


          if(!addressdata){
            return res.status(404).json({
              success:false,
              message:"Address Not Found"
            })
          }

          addressdata.type = type
          addressdata.latitude = lat
          addressdata.longitude = lng
          addressdata.address = address

          await addressdata.save()


          return res.status(200).json({
            success:true,
            message:"Address Update Successfully"
          })
        }



        const add = await models.Useraddress.create({
          user_id,
          type,
          address,
          latitude:lat,
          longitude:lng
        })






    return res.status(200).json({
      success: true,
      data: "Address Add Suceessfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function getaddress(req, res) {
  try {
 
       const user_id = req.apiAuth.user_id
      

       const addressdata = await models.Useraddress.findAll({
        where:{
          user_id
        }
       })

    return res.status(200).json({
      success: true,
      data: "Address get Suceessfully",
      data:addressdata
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  login: login,
  signup: signup,
  verifyOtp: verifyOtp,
  signuppassword: signuppassword,
  forgetpassword: forgetpassword,
  verifyforgetpassOtp: verifyforgetpassOtp,
  addprofileimage: addprofileimage,
  getuser: getuser,
  questions: questions,
  useranswer:useranswer,
  addaddress:addaddress,
  getaddress:getaddress
};
