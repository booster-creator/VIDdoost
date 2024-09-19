exports.handler = async function(event, context) {
  console.log('get-client-id function called'); // 디버깅용 로그
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }
  
  console.log('Returning client ID:', process.env.GOOGLE_CLIENT_ID); // 디버깅용 로그
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId: process.env.GOOGLE_CLIENT_ID })
  };
}