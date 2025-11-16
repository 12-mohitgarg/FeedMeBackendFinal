const admin = require('firebase-admin');
const path = require('path');

let customerApp;

// Initialize only Customer Firebase App
// const initFirebaseApp = () => {
//   if (!customerApp) {
//     // const serviceAccountCustomer = require(path.join(__dirname, "../zery-customer-firebase.json"));
//     const serviceAccountCustomer = require(path.join(__dirname, "../my-firebase-project-473406-firebase-adminsdk-fbsvc-0dbc105cf7.json"));
//     customerApp = admin.initializeApp({
//       credential: admin.credential.cert(serviceAccountCustomer),
//     }, 'customerApp');
//   }
// };

// initFirebaseApp();

/**
 * Send push notification via Firebase Admin SDK (FCM) to customer app
 * @param {string[]} tokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional custom payload
 */
const sendNotification = async (tokens, title, body, data = {}) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    console.warn('🚫 No FCM tokens provided');
    return;
  }

  try {
    const messagingService = customerApp.messaging();

    const payload = {
      notification: {
        title: title || 'Notification',
        body: body || '',
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
        return acc;
      }, {}),
    };

    // Check if sendMulticast exists
    if (typeof messagingService.sendMulticast === 'function') {
      const response = await messagingService.sendMulticast({ tokens, ...payload });
      console.log(`✅ FCM sent: ${response.successCount} success, ${response.failureCount} failed`);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`❌ Token failed [${tokens[idx]}]:`, resp.error?.message);
          }
        });
      }

      return response;
    } else {
      // Fallback: SDK too old, send one-by-one
      const responses = await Promise.all(tokens.map(token =>
        messagingService.send({ token, ...payload }).catch(error => ({ error }))
      ));

      const successCount = responses.filter(r => !r.error).length;
      const failureCount = responses.length - successCount;

      console.log(`⚠️ Fallback FCM: ${successCount} success, ${failureCount} failed`);

      responses.forEach((resp, idx) => {
        if (resp.error) {
          console.warn(`❌ Token failed [${tokens[idx]}]:`, resp.error?.message);
        }
      });

      return responses;
    }

  } catch (error) {
    console.error(`❌ FCM Error:`, error.message);
    return null;
  }
};

module.exports = sendNotification;
