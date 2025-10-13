

// const multer = require('multer');
// const path = require('path');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); 
    
//   },
// });


// const upload = multer({ storage: storage });

// module.exports = upload;






const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder path
const uploadDir = path.join(__dirname,"..", 'uploads');

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Uploads folder created at:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
