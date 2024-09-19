// netlify/functions/fetch-youtube-data.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // 여기서 사용자의 액세스 토큰을 가져와야 합니다 (예: 데이터베이스에서)
  const accessToken = 'USER_ACCESS_TOKEN';

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  try {
    const response = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching YouTube data', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch YouTube data' }),
    };
  }
};