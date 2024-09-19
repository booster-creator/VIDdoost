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

        videoDetailsData.items.forEach(item => {
            const duration = item.contentDetails.duration;
            console.log(`Processing video: ${item.snippet.title}, duration: ${duration}`);

            const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
            const minutes = match && match[1] ? parseInt(match[1]) : 0;
            const seconds = match && match[2] ? parseInt(match[2]) : 0;

            // 59초를 기준으로 1분 미만의 영상과 그 이상의 영상을 구분
            if ((minutes === 0 && seconds <= 59)) {
                shortsVideos.push(item);  // 59초 이하의 영상은 shorts로 분류
            } else {
                regularVideos.push(item);  // 1분 이상의 영상은 regular로 분류
            }
        });

        if (shortsOnly) {
            // shortsOnly가 true인 경우, 59초 이하의 영상만 반환
            return {
                statusCode: 200,
                body: JSON.stringify({ shortsVideos }),
            };
        } else {
            // shortsOnly가 false인 경우, 1분 이상의 영상만 반환
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
