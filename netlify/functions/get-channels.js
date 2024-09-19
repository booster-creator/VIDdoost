const { google } = require('googleapis');

exports.handler = async function(event, context) {
    // TODO: OAuth 토큰 검증 및 YouTube API 클라이언트 설정
    try {
        const youtube = google.youtube('v3');
        const response = await youtube.channels.list({
            mine: true,
            part: 'snippet'
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
        return {
            statusCode: 500,
            body: JSON.stringify({ error: '채널 정보 가져오기 실패' })
        };
    }
};
