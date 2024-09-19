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

function renderGoogleSignInButton() {
  gapi.signin2.render('google-signin-button', {
    'scope': 'https://www.googleapis.com/auth/youtube.readonly',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSignIn,
    'onfailure': onFailure
  });
}

function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  sendTokenToServer(id_token);
}

function onFailure(error) {
  console.error('Google Sign-In failed:', error);
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
  initGoogleAuth()
    .then(() => {
      renderGoogleSignInButton();
    })
    .catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
};