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
        }

        if (shortsOnly) {
            // shortsOnly가 true인 경우, 58초 이하의 숏츠 URL이 유효한 영상만 반환
            return {
                statusCode: 200,
                body: JSON.stringify({ shortsVideos }),
            };
        } else {
            // shortsOnly가 false인 경우, 1분 1초 이상의 영상만 반환
            return {
                statusCode: 200,
                body: JSON.stringify({ regularVideos }),
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
