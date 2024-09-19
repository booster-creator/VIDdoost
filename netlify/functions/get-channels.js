const { google } = require('googleapis');

exports.handler = async function(event, context) {
  try {
    // OAuth 클라이언트 설정 (이 부분은 실제 인증 로직에 맞게 수정해야 합니다)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // 여기에 액세스 토큰 설정 로직이 필요합니다
    // oauth2Client.setCredentials({ access_token: 'USER_ACCESS_TOKEN' });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const response = await youtube.channels.list({
      part: 'snippet',
      mine: true
    });

    const channels = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(channels)
    };
  } catch (error) {
    console.error('채널 정보 가져오기 실패:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '채널 정보를 가져오는 데 실패했습니다.' })
    };
  }
};