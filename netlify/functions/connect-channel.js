exports.handler = async function(event, context) {
    const { channelId } = event.queryStringParameters;
    // TODO: 채널 연동 로직 구현 (데이터베이스 저장 등)
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
    };
};