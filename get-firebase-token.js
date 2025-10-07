// Script to get Firebase token from service account
const admin = require('firebase-admin');

// You'll need to download the service account JSON from Firebase Console
// and place it in this directory as 'service-account.json'

const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Generate a custom token
admin.auth().createCustomToken('deployment-user')
  .then((customToken) => {
    console.log('Custom token:', customToken);
  })
  .catch((error) => {
    console.error('Error creating custom token:', error);
  });
