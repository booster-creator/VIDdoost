// netlify/functions/database.js
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    const { userId, channelId, channelData } = JSON.parse(event.body);
    try {
      const result = await client.query(
        q.Create(
          q.Collection('channels'),
          { data: { userId, channelId, ...channelData } }
        )
      );
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database error' })
      };
    }
  }
};