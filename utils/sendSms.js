const axios = require('axios')



const sendOtpOnMobile = async (mobile, otp)  =>  {
  const url = "https://alerts.kaleyra.com/api/v4/";
  const apiKey = "Abaf355325fc1e4acdf61636acae1e0f6";

  const data = {
      method: 'sms',
      sender: 'EVNTLN',
      to: `+91${mobile}`,
      message: `Your Eventlane OTP is ${otp}. Valid for 5 minutes.`,
      api_key: apiKey,
  };

  try {
      const response = await axios.post(url, null, {
          params: data,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });

      
      return response.data;
  } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw error;
  }
}
 
module.exports = sendOtpOnMobile;