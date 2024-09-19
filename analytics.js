function handleGoogleLogin() {
    // TODO: Google OAuth 로그인 구현
    console.log("Google 로그인 처리");
    // 로그인 성공 후 채널 목록 표시
    fetchChannels();
}
async function fetchChannels() {
    try {
      const response = await fetch('/.netlify/functions/get-channels');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const channels = await response.json();
      if (!Array.isArray(channels)) {
        throw new Error('Channels data is not an array');
      }
      displayChannels(channels);
    } catch (error) {
      console.error('채널 정보 가져오기 실패:', error);
      // 사용자에게 오류 메시지 표시
      document.getElementById('channelList').innerHTML = '<p>채널 정보를 가져오는 데 실패했습니다. 다시 시도해주세요.</p>';
    }
  }
  
  function displayChannels(channels) {
    const channelList = document.getElementById('channelListItems');
    channelList.innerHTML = '';
    if (channels.length === 0) {
      channelList.innerHTML = '<li>연결된 채널이 없습니다.</li>';
    } else {
      channels.forEach(channel => {
        const li = document.createElement('li');
        li.innerHTML = `<button onclick="connectChannel('${channel.id}')">${channel.title}</button>`;
        channelList.appendChild(li);
      });
    }
    document.getElementById('channelList').style.display = 'block';
  }

function displayChannels(channels) {
    const channelList = document.getElementById('channelListItems');
    channelList.innerHTML = '';
    channels.forEach(channel => {
        const li = document.createElement('li');
        li.innerHTML = `<button onclick="connectChannel('${channel.id}')">${channel.title}</button>`;
        channelList.appendChild(li);
    });
    document.getElementById('channelList').style.display = 'block';
}

async function connectChannel(channelId) {
    try {
        const response = await fetch(`/.netlify/functions/connect-channel?channelId=${channelId}`);
        const data = await response.json();
        if (data.success) {
            fetchDashboardData(channelId);
        }
    } catch (error) {
        console.error('채널 연동 실패:', error);
    }
}

async function fetchDashboardData(channelId) {
    try {
        const response = await fetch(`/.netlify/functions/get-dashboard-data?channelId=${channelId}`);
        const data = await response.json();
        displayDashboard(data);
    } catch (error) {
        console.error('대시보드 데이터 가져오기 실패:', error);
    }
}

function displayDashboard(data) {
    const dashboard = document.getElementById('dashboard');
    const metricsDiv = document.getElementById('performanceMetrics');
    const videosDiv = document.getElementById('recentVideos');

    metricsDiv.innerHTML = `
        <h4>채널 성과</h4>
        <p>구독자 수: ${data.subscriberCount}</p>
        <p>총 조회수: ${data.viewCount}</p>
        <p>평균 CTR: ${data.averageCTR}%</p>
        <p>평균 시청 시간: ${data.averageViewDuration} 분</p>
    `;

    videosDiv.innerHTML = '<h4>최근 영상</h4>';
    data.recentVideos.forEach(video => {
        videosDiv.innerHTML += `
            <div>
                <h5>${video.title}</h5>
                <p>조회수: ${video.views} | 좋아요: ${video.likes} | 댓글: ${video.comments}</p>
            </div>
        `;
    });

    dashboard.style.display = 'block';
}