exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId: process.env.GOOGLE_CLIENT_ID })
  };
}