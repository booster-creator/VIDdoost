function handleGoogleLogin() {
    // TODO: Google OAuth 로그인 구현
    console.log("Google 로그인 처리");
    // 로그인 성공 후 채널 목록 표시
    fetchChannels();
}

async function fetchChannels() {
    try {
        const response = await fetch('/.netlify/functions/get-channels');
        const channels = await response.json();
        displayChannels(channels);
    } catch (error) {
        console.error('채널 정보 가져오기 실패:', error);
    }
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