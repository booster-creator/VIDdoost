// netlify/functions/get-user-channels.js
const { google } = require('googleapis');

exports.handler = async function(event, context) {
  // 인증 토큰은 쿠키나 헤더에서 가져옵니다.
  const token = event.headers.authorization.split(' ')[1];

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  try {
    const response = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true
    });

    const channels = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      subscriberCount: item.statistics.subscriberCount
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(channels)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '채널 정보를 가져오는데 실패했습니다.' })
    };
  }
};

// netlify/functions/analyze-channel.js
exports.handler = async function(event, context) {
  const { channelId } = event.queryStringParameters;
  const token = event.headers.authorization.split(' ')[1];

  // YouTube API를 사용하여 채널 분석 수행
  // ...

  return {
    statusCode: 200,
    body: JSON.stringify({ /* 분석 결과 */ })
  };
};