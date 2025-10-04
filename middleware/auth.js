const jwt = require("jsonwebtoken");
const { StatusCode, Status } = require("../app/constant/HttpConstant");
const { MessageContant } = require("../app/constant/Message");



async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;


    if (!authHeader) {
      return res.status(StatusCode.HTTP_BAD_REQUEST).json({
        status: Status.STATUS_FALSE,
        message: MessageContant.token_not_exists,
        data: [],
      });
    }

    

    const token = authHeader.split(" ")[1];

    
    let decodedToken;
    try {
      decodedToken = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });
    } catch (err) {
      let statusCode = StatusCode.HTTP_BAD_REQUEST;
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError" ||
        err.name === "NotBeforeError"
      ) {
        return res.status(statusCode).json({
          status: Status.STATUS_FALSE,
          message: err.message,
          data: [],
        });
      } else {
        return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
          status: Status.STATUS_FALSE,
          message: err.message,
          data: [],
        });
      }
    }
    req.apiAuth = decodedToken;
   
    

   

    

    next();
  } catch (error) {
    return res.status(StatusCode.HTTP_INTERNAL_SERVER_ERROR).json({
      status: Status.STATUS_FALSE,
      message: error.message,
      data: [],
    });
  }
}
module.exports = {
  checkAuth: checkAuth,
};
