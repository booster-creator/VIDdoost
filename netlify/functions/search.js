const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    console.log("Handler started");

    const query = event.queryStringParameters.q;
    const publishedAfter = event.queryStringParameters.publishedAfter;
    const shortsOnly = event.queryStringParameters.shortsOnly === 'true';
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!query || !publishedAfter) {
        console.log("Missing query or publishedAfter parameter");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required query parameters' }),
        };
    }

    try {
        console.log("Sending request to YouTube API");
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&publishedAfter=${publishedAfter}&maxResults=50&order=viewCount&key=${apiKey}`;
        const response = await fetch(youtubeApiUrl);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ shortsVideos: [], regularVideos: [], topVideos: [] }),
            };
        }

        const videoIds = data.items.map(item => item.id.videoId);
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        const videoDetailsData = await response.json();

        const shortsVideos = [];
        const regularVideos = [];
        const topVideos = [];

        for (const item of videoDetailsData.items) {
            const duration = item.contentDetails.duration;
            const subscriberCount = item.statistics.subscriberCount || 1;
            const viewCount = item.statistics.viewCount || 0;

            // 조회수/구독자 비율 계산
            const viewSubscriberRatio = (viewCount / subscriberCount) * 100;

            // 30% 이상의 조회수/구독자 비율 통과
            if (viewSubscriberRatio >= 30) {
                topVideos.push(item);
            }

            const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
            const minutes = match && match[1] ? parseInt(match[1]) : 0;
            const seconds = match && match[2] ? parseInt(match[2]) : 0;

            if (minutes === 0 && seconds <= 58) {
                shortsVideos.push(item);
            } else {
                regularVideos.push(item);
            }
        }

        // 최근 한 달 조회수 상위 정렬
        topVideos.sort((a, b) => b.statistics.viewCount - a.statistics.viewCount);

        if (shortsOnly) {
            return {
                statusCode: 200,
                body: JSON.stringify({ shortsVideos, topVideos }),
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({ regularVideos, topVideos }),
            };
        }

    } catch (error) {
        console.log(`Error occurred: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
