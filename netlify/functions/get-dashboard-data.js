const { google } = require('googleapis');

exports.handler = async function(event, context) {
    const { channelId } = event.queryStringParameters;
    // TODO: OAuth 토큰 검증 및 YouTube API 클라이언트 설정
    try {
        const youtube = google.youtube('v3');
        // 채널 통계 및 최근 영상 데이터 가져오기
        // 실제 구현에서는 여러 API 호출이 필요할 수 있습니다.
        const channelResponse = await youtube.channels.list({
            id: channelId,
            part: 'statistics'
        });
        const videoResponse = await youtube.search.list({
            channelId: channelId,
            part: 'snippet',
            order: 'date',
            type: 'video',
            maxResults: 5
        });

        // 예시 데이터 (실제 구현에서는 API 응답을 처리해야 합니다)
        const dashboardData = {
            subscriberCount: channelResponse.data.items[0].statistics.subscriberCount,
            viewCount: channelResponse.data.items[0].statistics.viewCount,
            averageCTR: 5.2,
            averageViewDuration: 4.3,
            recentVideos: videoResponse.data.items.map(item => ({
                title: item.snippet.title,
                views: Math.floor(Math.random() * 10000),
                likes: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 100)
            }))
        };

        return {
            statusCode: 200,
            body: JSON.stringify(dashboardData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: '대시보드 데이터 가져오기 실패' })
        };
    }
};