// netlify/functions/google-auth.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // 인증 URL 생성
  const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url }),
  };
};