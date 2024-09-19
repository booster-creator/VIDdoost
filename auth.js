function initGoogleAuth() {
    gapi.load('auth2', function() {
      gapi.auth2.init({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
      }).then(function() {
        console.log('Google Auth initialized');
        // 로그인 버튼에 이벤트 리스너 추가
        document.getElementById('google-login-button').addEventListener('click', signIn);
      });
    });
  }
  
  function signIn() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function(googleUser) {
      // 로그인 성공 처리
      const id_token = googleUser.getAuthResponse().id_token;
      // 서버로 토큰 전송
      sendTokenToServer(id_token);
    }).catch(function(error) {
      console.error('Error during sign in', error);
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
      // 로그인 성공 후 처리 (예: 페이지 리디렉션)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  
  // 페이지 로드 시 Google Auth 초기화
  window.onload = initGoogleAuth;