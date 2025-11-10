const fs = require('fs');
const http = require('http');
const app = require('./app');
require('dotenv').config();
require("./cron/sendNotificationCron.js");

const port = process.env.PORT;



const server = http.createServer( app);

server.listen(port, () => {
  console.log(`Server is running at the port no. ${port}`);
});
