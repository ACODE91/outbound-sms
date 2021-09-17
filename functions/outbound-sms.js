const createProxySession = (client) => {
    // client.proxy.services('KSc933cd50ee87b0cc7827ce7fda07144c')
    //         .sessions
    //         .create({
    //            uniqueName: 'SID_FROM_CHANNELS_API',
    //            mode: 'message-only',
    //            participants: [{'Identifier': 'CUSTOMER_NUMBER'}]
    //          })
    //         .then(session => console.log(`Created proxy session for chat channel: ${session.sid}.`));
    console.log(client, 'whats the client?')
}

exports.handler = async (context, event, callback) => {
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    console.log('Event properties:');
    Object.keys(event).forEach(key => {
      console.log(`${key}: ${event[key]}`);
    });
  
    if (Object.keys(event).length === 0) {
      console.log('Empty event object, likely an OPTIONS request');
      return callback(null, response);
    }
  
    const {
      token,
      taskSid,
      to,
      from
    } = event;
  
    console.log('Validating request token');
    const tokenValidationApi = `https://iam.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/validate`;
    const fetchResponse = await nodeFetch(tokenValidationApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Base64.encode(`${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`)}`
      },
      body: JSON.stringify({
        token
      })
    });
    const tokenResponse = await fetchResponse.json();
    console.log('Token validation response properties:');
    Object.keys(tokenResponse).forEach(key => {
      console.log(`${key}: ${tokenResponse[key]}`);
    });

    if (!tokenResponse.valid) {
      response.setStatusCode(401);
      response.setBody({
        status: 401,
        message: 'Your authentication token failed validation',
        detail: tokenResponse.message
      });
      return callback(null, response);
    }
    console.log(context, 'context???')
    console.log(`Adding ${to} to named conference ${taskSid}`);
    const client = context.getTwilioClient();
   
    // Create Proxy Session for Chat Channel
    createProxySession(client);

    response.setBody({
      status: 200,
      _version: undefined
    });
  
    return callback(null, response);
  };
  