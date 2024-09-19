// netlify/functions/auth.js
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.handler = async function(event, context) {
  if (event.httpMethod === 'GET') {
    // 인증 URL 생성
    const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
    return {
      statusCode: 302,
      headers: {
        Location: url,
      }
    };
  } else if (event.httpMethod === 'POST') {
    // 인증 코드로 토큰 교환
    const { code } = JSON.parse(event.body);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // 토큰을 안전하게 저장해야 합니다 (다음 단계에서 다룹니다)
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }
};