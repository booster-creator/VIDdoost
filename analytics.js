// analytics.js
function fetchUserChannels() {
    fetch('/.netlify/functions/get-user-channels')
      .then(response => response.json())
      .then(channels => {
        displayChannels(channels);
      })
      .catch(error => console.error('Error:', error));
  }
  
  function displayChannels(channels) {
    const channelList = document.getElementById('channelList');
    channelList.innerHTML = '';
    channels.forEach(channel => {
      const channelElement = document.createElement('div');
      channelElement.innerHTML = `
        <h3>${channel.title}</h3>
        <p>구독자 수: ${channel.subscriberCount}</p>
        <button onclick="analyzeChannel('${channel.id}')">분석하기</button>
      `;
      channelList.appendChild(channelElement);
    });
  }
  
  function analyzeChannel(channelId) {
    fetch(`/.netlify/functions/analyze-channel?channelId=${channelId}`)
      .then(response => response.json())
      .then(data => {
        displayAnalytics(data);
      })
      .catch(error => console.error('Error:', error));
  }