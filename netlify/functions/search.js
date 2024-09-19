async function searchVideos() {
  const query = document.getElementById('searchInput').value;
  const shortsOnly = document.getElementById('shortsCheckbox').checked;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const publishedAfter = oneMonthAgo.toISOString();

  try {
      const response = await fetch(`/.netlify/functions/search?q=${query}&publishedAfter=${publishedAfter}&shortsOnly=${shortsOnly}`);
      const data = await response.json();

      // 검색 결과가 없을 때
      if ((!data.shortsVideos || data.shortsVideos.length === 0) && (!data.regularVideos || data.regularVideos.length === 0)) {
          console.log('검색 결과가 없습니다.');
          document.getElementById('results').innerHTML = '<p>검색 결과가 없습니다.</p>';
          return;
      }

      // 결과 표시 영역 초기화
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = ''; 

      const videosToDisplay = shortsOnly ? data.shortsVideos : data.regularVideos;

      videosToDisplay.forEach(item => {
          const thumbnailUrl = item.snippet.thumbnails.default.url;
          const title = item.snippet.title;
          const viewCount = item.statistics.viewCount;
          const publishedAt = new Date(item.snippet.publishedAt).toLocaleDateString();
          const channelTitle = item.snippet.channelTitle;
          const videoUrl = `https://www.youtube.com/watch?v=${item.id}`;

          const videoElement = `
              <div>
                  <img src="${thumbnailUrl}" alt="Thumbnail">
                  <a href="${videoUrl}" target="_blank">${title}</a>
                  <p>${viewCount} views - ${publishedAt} - ${channelTitle}</p>
              </div>
          `;
          resultsDiv.innerHTML += videoElement;
      });

  } catch (error) {
      console.error('검색 중 오류 발생:', error);
      document.getElementById('results').innerHTML = '<p>검색 중 오류가 발생했습니다.</p>';
  }
}
