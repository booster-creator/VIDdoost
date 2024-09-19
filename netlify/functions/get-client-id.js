exports.handler = async function(event, context) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId: process.env.GOOGLE_CLIENT_ID })
  };
}