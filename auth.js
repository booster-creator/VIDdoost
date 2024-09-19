function initGoogleAuth() {
  fetch('/.netlify/functions/get-client-id')
    .then(response => response.json())
    .then(data => {
      gapi.load('auth2', function() {
        gapi.auth2.init({
          client_id: data.clientId,
          scope: 'https://www.googleapis.com/auth/youtube.readonly'
        }).then(function() {
          console.log('Google Auth initialized');
        }).catch(function(error) {
          console.error('Error initializing Google Auth:', error);
        });
      });
    })
    .catch(error => console.error('Error fetching client ID:', error));
}

// ... 나머지 코드는 동일 ...
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