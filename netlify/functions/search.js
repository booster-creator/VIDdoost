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

        // PT#M#S or PT#M or PT#S 형태의 duration에서 시간을 추출
        const match = duration.match(/PT(\d+)M(\d+)S/) || duration.match(/PT(\d+)M/) || duration.match(/PT(\d+)S/); 
        const minutes = match && match[1] ? parseInt(match[1]) : 0;
        const seconds = match && match[2] ? parseInt(match[2]) : 0;

        // 1분 미만의 영상은 shorts로 분류
        if (minutes === 0 && seconds < 60) {
            shortsVideos.push(item);
        } else {
            regularVideos.push(item);
        }
    });

    // shortsOnly가 true일 때 shortsVideos만 반환, 그렇지 않으면 regularVideos만 반환
    if (shortsOnly) {
        return {
            statusCode: 200,
            body: JSON.stringify({ shortsVideos }),
        };
    } else {
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
