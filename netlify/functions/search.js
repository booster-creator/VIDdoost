const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q;
  const publishedAfter = event.queryStringParameters.publishedAfter;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query || !publishedAfter) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required query parameters' }),
    };
  }

  try {
    // YouTube API에서 동영상 검색
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&publishedAfter=${publishedAfter}&maxResults=50&order=viewCount&key=${apiKey}`;
    const response = await fetch(youtubeApiUrl);
    const data = await response.json();

    if (response.ok && data.items && data.items.length > 0) {
      // 각 동영상의 세부 정보를 가져오기 위해 추가 API 호출
      const videoIds = data.items.map(item => item.id.videoId);
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
      const videoDetailsResponse = await fetch(videoDetailsUrl);
      const videoDetailsData = await videoDetailsResponse.json();

      // Hit 동영상 필터링
      const hitVideos = videoDetailsData.items.filter(item => {
        const viewCount = parseInt(item.statistics.viewCount);
        const subscriberCount = parseInt(item.statistics.subscriberCount);
        const subGrowthRate = (subscriberCount / (subscriberCount + viewCount + 0.1)) * 100;

        return (viewCount >= subscriberCount * 0.3) && (subGrowthRate > 0);
      });

      // 한 달 이내 조회수 순으로 정렬된 동영상
      const recentVideos = videoDetailsData.items.sort((a, b) => {
        return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ hitVideos, recentVideos }),
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
      body: JSON.stringify({ error: 'Server error', details: error.message }),
    };
  }
};
