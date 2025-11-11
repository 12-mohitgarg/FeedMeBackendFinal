const cron = require("node-cron");
const { sendNotificatio } = require("../app/controller/restaurantController.js");

// run every 4 hours
cron.schedule("* * * * *", async () => {
  console.log("SEND NOTIFICATION CRON RUNNING --- ", new Date());

  // call your function — but this function is expecting req,res so call internal logic not express response
  await sendNotificatio(null, {
    status: () => ({ json: () => {} })
  });
});
