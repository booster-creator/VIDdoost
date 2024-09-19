// login.js
async function initiateGoogleLogin() {
    try {
      const response = await fetch('/.netlify/functions/google-auth');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to initiate Google login', error);
    }
  }
  
  // HTML에 로그인 버튼 추가
  <button onclick="initiateGoogleLogin()">Google로 로그인</button>
  