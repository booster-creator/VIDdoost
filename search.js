const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q;
  const publishedAfter = event.queryStringParameters.publishedAfter;
  const apiKey = process.env.YOUTUBE_API_KEY; // 환경변수로 설정된 API 키 사용

  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&publishedAfter=${publishedAfter}&maxResults=50&order=viewCount&key=${apiKey}`;

  try {
    const response = await fetch(youtubeApiUrl);
    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error fetching data from YouTube API' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: error.message }),
    };
  }
};
