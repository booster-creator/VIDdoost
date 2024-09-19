// netlify/functions/session.js
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    const { userId } = JSON.parse(event.body);
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };
  } else if (event.httpMethod === 'GET') {
    const token = event.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        statusCode: 200,
        body: JSON.stringify({ userId: decoded.userId })
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
  }
};