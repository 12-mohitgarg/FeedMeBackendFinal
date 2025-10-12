
const express = require("express");
const auth = require('../middleware/auth.js')

const router = express.Router();

const upload = require("../config/multerConfig.js");



const userController = require('../app/controller/userController.js');
const restaurantController = require('../app/controller/restaurantController.js');



router.post(
  "/login",
  userController.login
);
router.post(
  "/signup",
  userController.signup
);
router.post(
  "/signup/verifyOtp",auth.checkAuth,
  userController.verifyOtp
);
router.post(
  "/update-password",auth.checkAuth,
  userController.signuppassword
);
router.post(
  "/forgot-password",
  userController.forgetpassword
);
router.post(
  "/forgot-password/verifyOtp",
  userController.verifyforgetpassOtp
);
router.post(
  "/user/add-image" , upload.fields([{ name: "file", maxCount: 1 }]), auth.checkAuth,
  userController.addprofileimage
);
router.get(
  "/user/get",auth.checkAuth,
  userController.getuser
);
router.post(
  "/restaurat/add",upload.fields([{ name: "file", maxCount: 1 }]),
  restaurantController.addrestaurant
);
router.post(
  "/restaurat/get",
  restaurantController.getrestaurent
);
router.post(
  "/user/add-action",auth.checkAuth,
  restaurantController.addinteractionhistory
);
router.post(
  "/user/get-action",auth.checkAuth,
  restaurantController.getinteractionhistory
);
router.post(
  "/user/delete-action",
  restaurantController.deleteinteractionhistory
);
router.get(
  "/user/get-questions",
  userController.questions
);
router.post(
  "/user/answers",auth.checkAuth,
  userController.useranswer
);
router.post(
  "/user/add-address",auth.checkAuth,
  userController.addaddress
);
router.get(
  "/user/get-address",auth.checkAuth,
  userController.getaddress
);




module.exports = router;
