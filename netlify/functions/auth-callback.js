// netlify/functions/auth-callback.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { code } = event.queryStringParameters;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 여기서 토큰을 안전하게 저장해야 합니다 (예: 데이터베이스)

    return {
      statusCode: 302,
      headers: {
        Location: '/dashboard', // 사용자를 대시보드 페이지로 리디렉션
      },
    };
  } catch (error) {
    console.error('Error during token exchange', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' }),
    };
  }
};