const nodeFetch = require("node-fetch");
const { Base64 } = require("js-base64");

const createChatChannel = async (client, params) => {
  return await client.flexApi.channel
    .create({
      target: params.outboundPhoneNumber,
      taskAttributes: JSON.stringify({
        to: params.outboundPhoneNumber,
        direction: "outbound",
        name: "Aaron",
        autoAnswer: "true",
      }),
      identity: "sms_outbound_aaron",
      chatFriendlyName: "Outbound Chat with Aaron",
      flexFlowSid: params.flexFlowSid,
      chatUserFriendlyName: "Agent_Aaron",
    })
    .then((channel) => {
      return channel.sid;
    });
};

const createProxySession = async (
  client,
  proxyServiceSID,
  customerNumber,
  chatChannelSid
) => {
  return await client.proxy
    .services(proxyServiceSID)
    .sessions.create({
      uniqueName: chatChannelSid,
      mode: "message-only",
      participants: [{ Identifier: customerNumber }],
    })
    .then((res) => {
      return res.sid;
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
    });
};

const fetchChannelResource = async (client, chatServiceSid, chatChannelSid) => {
  return await client.chat
    .services(chatServiceSid)
    .channels(chatChannelSid)
    .fetch()
    .then((channel) => {
      console.log(`Fetched chat channel resource: ${channel.friendlyName}`);
      return channel;
    });
};

const addAgentToSession = async (client, proxyParams) => {
  const {
    proxyServiceSID,
    sessionSID,
    customerNumber,
    chatChannelSid,
    twilioNumber,
  } = proxyParams;

  await client.proxy
    .services(proxyServiceSID)
    .sessions(sessionSID)
    .participants.create({
      proxyIdentifier: twilioNumber,
      friendlyName: customerNumber,
      identifier: chatChannelSid,
    })
    .then((participant) =>
      console.log(`Created participant for agent: ${participant.sid}`)
    );
};

const updateChatChannelAttributes = async (client, params) => {
  const { chatService, chatChannel, chatChannelAttributes, proxySessionSid } = params;
  const attributes = Object.assign(chatChannelAttributes, {proxySession: proxySessionSid })
  await client.chat
    .services(chatService)
    .channels(chatChannel)
    .update({
      attributes: JSON.stringify(attributes),
    })
    .then((channel) =>
      console.log(`Created Chat Channel: ${channel.friendlyName}`)
    );
};

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "POST");
  response.appendHeader("Content-Type", "application/json");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log("Event properties:");
  Object.keys(event).forEach((key) => {
    console.log(`${key}: ${event[key]}`);
  });

  const { token, outboundPhoneNumber } = event;

  console.log("Validating request token");
  const tokenValidationApi = `https://iam.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/validate`;
  const fetchResponse = await nodeFetch(tokenValidationApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Base64.encode(
        `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`
      )}`,
    },
    body: JSON.stringify({
      token,
    }),
  });
  const tokenResponse = await fetchResponse.json();
  console.log("Token validation response properties:");
  Object.keys(tokenResponse).forEach((key) => {
    console.log(`${key}: ${tokenResponse[key]}`);
  });

  if (!tokenResponse.valid) {
    response.setStatusCode(401);
    response.setBody({
      status: 401,
      message: "Your authentication token failed validation",
      detail: tokenResponse.message,
    });
    return callback(null, response);
  }

  const client = context.getTwilioClient();

  // Create the Chat Channel
  const chatChannelSid = await createChatChannel(client, {
    outboundPhoneNumber,
    flexFlowSid: context.FLEX_FLOW_SID,
  });

  // Retrieve Attributes
  const channelResource = await fetchChannelResource(
    client,
    context.CHAT_SERVICE_SID,
    chatChannelSid
  );
  const chatChannelAttributes = JSON.parse(channelResource.attributes);

  // Create Proxy Session for Chat Channel
  const sessionSid = await createProxySession(
    client,
    context.PROXY_SERVICE,
    outboundPhoneNumber,
    chatChannelSid
  );

  // Add agent to the session
  await addAgentToSession(client, {
    proxyServiceSID: context.PROXY_SERVICE,
    sessionSID: sessionSid,
    customerNumber: outboundPhoneNumber,
    chatChannelSid: chatChannelSid,
    twilioNumber: chatChannelAttributes.twilioNumber,
  });

  // Update the Chat Channel attributes to include the Proxy Session SID you created.
  await updateChatChannelAttributes(client, {
    chatService: context.CHAT_SERVICE_SID,
    chatChannel: chatChannelSid,
    chatChannelAttributes,
    proxySessionSid: sessionSid
  });

  response.setBody({
    status: 200,
    _version: undefined,
  });

  return callback(null, response);
};
