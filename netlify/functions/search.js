const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q;
  const publishedAfter = event.queryStringParameters.publishedAfter;
  const shortsOnly = event.queryStringParameters.shortsOnly === 'true';  // 체크박스의 상태를 받아옵니다.
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

    if (response.ok && data.items && data.items.length > 0) {
      const videoIds = data.items.map(item => item.id.videoId);
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
      const videoDetailsResponse = await fetch(videoDetailsUrl);
      const videoDetailsData = await videoDetailsResponse.json();

      // 1분 미만의 영상과 1분 이상의 영상을 분류
      const shortsVideos = [];
      const regularVideos = [];

      videoDetailsData.items.forEach(item => {
        const duration = item.contentDetails.duration;
        const match = duration.match(/PT(\d+)M(\d+)S/); // ISO 8601 형식의 시간 파싱
        const minutes = match ? parseInt(match[1]) : 0;
        const seconds = match ? parseInt(match[2]) : parseInt(duration.match(/PT(\d+)S/)[1]);

        if (minutes === 0 && seconds < 60) {
          shortsVideos.push(item);  // 1분 미만의 영상은 shorts로 분류
        } else {
          regularVideos.push(item);  // 1분 이상의 영상은 regular로 분류
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ shortsVideos, regularVideos }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No results found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
