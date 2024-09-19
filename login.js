// login.js
function initGoogleLogin() {
    gapi.load('auth2', function() {
      gapi.auth2.init({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
      }).then(function(auth2) {
        document.getElementById('login-button').addEventListener('click', function() {
          auth2.signIn().then(onSignIn);
        });
      });
    });
  }
  
  function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    // 서버에 토큰 전송
    fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: id_token })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // 로그인 성공 처리
        fetchUserChannels();
      }
    })
    .catch(error => console.error('Error:', error));
  }