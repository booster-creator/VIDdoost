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

        let shortsVideos = [];
        let regularVideos = [];
        let topVideos = [];

        for (const item of videoDetailsData.items) {
            const videoId = item.id;
            const videoUrl = `https://www.youtube.com/shorts/${videoId}`;
            const duration = item.contentDetails.duration;

            const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
            const minutes = match && match[1] ? parseInt(match[1]) : 0;
            const seconds = match && match[2] ? parseInt(match[2]) : 0;

            // 58초 이하의 영상과 1분 1초 이상의 영상을 구분
            if (minutes === 0 && seconds <= 58) {
                // 숏츠 URL이 유효한지 확인
                const shortsResponse = await fetch(videoUrl);
                if (shortsResponse.ok) {
                    shortsVideos.push(item);  // 58초 이하의 유효한 숏츠 URL을 가진 영상은 shorts로 분류
                } else {
                    regularVideos.push(item);  // 숏츠 URL이 유효하지 않으면 regular로 분류
                }
            } else if (minutes >= 1 || (minutes === 0 && seconds >= 61)) {
                regularVideos.push(item);  // 1분 1초 이상의 영상은 regular로 분류
            }

            // 조회수/구독자 비율 기반으로 topVideos 계산
            const viewCount = parseInt(item.statistics.viewCount, 10);
            const subscriberCount = parseInt(item.statistics.subscriberCount, 10);
            if (subscriberCount > 0 && (viewCount / subscriberCount) >= 0.3) {
                topVideos.push(item);
            }
        }

        // 최근 한 달 이내 조회수 상위 5개 동영상
        topVideos = videoDetailsData.items
            .filter(item => new Date(item.snippet.publishedAt) >= new Date(publishedAfter))
            .sort((a, b) => parseInt(b.statistics.viewCount, 10) - parseInt(a.statistics.viewCount, 10))
            .slice(0, 5);

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
