let googleAuth;

function initGoogleAuth() {
  return new Promise((resolve, reject) => {
    gapi.load('auth2', () => {
      fetch('/.netlify/functions/get-client-id')
        .then(response => response.json())
        .then(data => {
          gapi.auth2.init({
            client_id: data.clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly'
          }).then(auth => {
            googleAuth = auth;
            console.log('Google Auth initialized');
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
    console.error('Google Auth not initialized');
    return;
  }
  
  googleAuth.signIn().then(googleUser => {
    const id_token = googleUser.getAuthResponse().id_token;
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
    console.log('Success:', data);
    // 로그인 성공 후 처리
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

window.onload = () => {
  initGoogleAuth().catch(error => {
    console.error('Failed to initialize Google Auth:', error);
  });
};

window.handleGoogleLogin = handleGoogleLogin;