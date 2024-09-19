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
                body: JSON.stringify({ shortsVideos: [], regularVideos: [] }),
            };
        }

        const videoIds = data.items.map(item => item.id.videoId);
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        const videoDetailsData = await videoDetailsResponse.json();

        const shortsVideos = [];
        const regularVideos = [];
        const topVideos = []; // 조회수/구독자 비율 상위와 최근 한달 조회수 상위 비디오들

        for (const item of videoDetailsData.items) {
            const duration = item.contentDetails.duration;
            const subscriberCount = item.statistics.subscriberCount || 1; // 구독자 수
            const viewCount = item.statistics.viewCount || 0; // 조회수

            // 조회수/구독자 비율 계산
            const viewSubscriberRatio = (viewCount / subscriberCount) * 100;

            // 30% 이상의 조회수/구독자 비율만 통과
            if (viewSubscriberRatio >= 30) {
                topVideos.push(item);
            }

            // 58초 이하 영상과 1분 1초 이상의 영상 구분
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
            // shortsOnly가 true인 경우, 58초 이하의 숏츠 URL이 유효한 영상만 반환
            return {
                statusCode: 200,
                body: JSON.stringify({ shortsVideos, topVideos }),
            };
        } else {
            // shortsOnly가 false인 경우, 1분 1초 이상의 영상만 반환
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
