const { google } = require('googleapis');

exports.handler = async function(event, context) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://vidboost.netlify.app/.netlify/functions/auth-callback'
  );

  // 나머지 인증 처리 로직...
}