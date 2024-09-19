const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q;
  const publishedAfter = event.queryStringParameters.publishedAfter;
  const shortsOnly = event.queryStringParameters.shortsOnly === 'true'; 
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query || !publishedAfter) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required query parameters' }),
    };
  }

  try {
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
        const match = duration.match(/PT(\d+)M(\d+)S/) || duration.match(/PT(\d+)M/) || duration.match(/PT(\d+)S/); 
        const minutes = match && match[1] ? parseInt(match[1]) : 0;
        const seconds = match && match[2] ? parseInt(match[2]) : 0;

        if (minutes === 0 && seconds < 60) {
            shortsVideos.push(item);  // 1분 미만의 영상은 shorts로 분류
        } else {
            regularVideos.push(item);  // 1분 이상의 영상은 regular로 분류
        }
    });

    // shortsOnly가 true일 때만 shortsVideos와 regularVideos 모두 반환, 아니면 regularVideos만 반환
    if (shortsOnly) {
        return {
            statusCode: 200,
            body: JSON.stringify({ shortsVideos, regularVideos }),
        };
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify({ regularVideos }),
        };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
