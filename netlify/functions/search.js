const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log("Handler started");
  const query = event.queryStringParameters.q;
  const publishedAfter = event.queryStringParameters.publishedAfter;
  const shortsOnly = event.queryStringParameters.shortsOnly === 'true';  // 체크박스의 상태를 받아옵니다.
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

    if (!response.ok) {
        console.log(`YouTube API error: ${response.statusText}`);
        throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
        console.log('No videos found');
        throw new Error('No videos found.');
    }

    console.log("Processing video data");

    const videoIds = data.items.map(item => item.id.videoId);
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
    const videoDetailsResponse = await fetch(videoDetailsUrl);
    const videoDetailsData = await videoDetailsResponse.json();

    if (!videoDetailsData.items || videoDetailsData.items.length === 0) {
        console.log('No video details found');
        throw new Error('No video details found.');
    }

    // 1분 미만의 영상과 1분 이상의 영상을 분류
    const shortsVideos = [];
    const regularVideos = [];

    videoDetailsData.items.forEach(item => {
        const duration = item.contentDetails.duration;
        console.log(`Processing video: ${item.snippet.title}, duration: ${duration}`);

        if (duration) {
            const match = duration.match(/PT(\d+)M(\d+)S/) || duration.match(/PT(\d+)M/) || duration.match(/PT(\d+)S/); 
            const minutes = match && match[1] ? parseInt(match[1]) : 0;
            const seconds = match && match[2] ? parseInt(match[2]) : 0;

            if (minutes === 0 && seconds < 60) {
              shortsVideos.push(item);  // 1분 미만의 영상은 shorts로 분류
            } else {
              regularVideos.push(item);  // 1분 이상의 영상은 regular로 분류
            }
        } else {
            console.log(`Skipping video: ${item.snippet.title}, duration is null or undefined`);
        }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ shortsVideos, regularVideos }),
    };
  } catch (error) {
    console.log(`Error occurred: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
