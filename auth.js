let googleAuth;

function initGoogleAuth() {
  return new Promise((resolve, reject) => {
    gapi.load('auth2', () => {
      fetch('/.netlify/functions/get-client-id')
        .then(response => response.json())
        .then(data => {
          console.log('Received client ID:', data.clientId); // 디버깅용 로그
          gapi.auth2.init({
            client_id: data.clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly'
          }).then(auth => {
            googleAuth = auth;
            console.log('Google Auth initialized successfully');
            resolve(auth);
          }).catch(error => {
            console.error('Error initializing Google Auth:', error);
            reject(error);
          });
        })
        .catch(error => {
          console.error('Error fetching client ID:', error);
          reject(error);
        });
    });
  });
}

function handleGoogleLogin() {
  if (!googleAuth) {
    console.log('Google Auth not initialized, attempting to initialize...');
    initGoogleAuth().then(() => {
      performSignIn();
    }).catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
  } else {
    performSignIn();
  }
}

function performSignIn() {
  googleAuth.signIn().then(googleUser => {
    const id_token = googleUser.getAuthResponse().id_token;
    console.log('Successfully signed in, sending token to server');
    sendTokenToServer(id_token);
  }).catch(error => {
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
    console.log('Server response:', data);
    // 로그인 성공 후 처리
  })
  .catch((error) => {
    console.error('Error sending token to server:', error);
  });
}

// 페이지 로드 시 Google Auth 초기화
document.addEventListener('DOMContentLoaded', () => {
  initGoogleAuth().catch(error => {
    console.error('Failed to initialize Google Auth on page load:', error);
  });
});

// 전역 스코프에 함수 노출
window.handleGoogleLogin = handleGoogleLogin;