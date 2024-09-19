function initGoogleAuth() {
    gapi.load('auth2', function() {
      gapi.auth2.init({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Netlify 환경 변수에서 가져오는 것이 좋습니다
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
      }).then(function() {
        console.log('Google Auth initialized');
      }).catch(function(error) {
        console.error('Error initializing Google Auth:', error);
      });
    });
  }
  
  function handleGoogleLogin() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function(googleUser) {
      const id_token = googleUser.getAuthResponse().id_token;
      // 서버로 토큰 전송
      sendTokenToServer(id_token);
    }).catch(function(error) {
      console.error('Error during Google sign in:', error);
    });
  }
  
  function sendTokenToServer(token) {
    fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // 로그인 성공 후 처리
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  
  window.onload = initGoogleAuth;
  
  // 전역 스코프에 함수 노출
  window.handleGoogleLogin = handleGoogleLogin;