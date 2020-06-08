const WebSocket = require('ws');
const AWS = require('aws-sdk');

function connect(url, token, stackName, compact, sam, rule, ruleArn, target) {
  const lambda = new AWS.Lambda({
    endpoint: 'http://127.0.0.1:3001/',
    sslEnabled: false
  });
  const ws = new WebSocket(url);

  ws.on('open', function open() {
    const payload = JSON.stringify({
      action: 'register',
      token: token,
      stack: stackName,
      localRule: rule,
      ruleArn: ruleArn,
      target: target
    });
    ws.send(payload, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });

  ws.on('message', async function incoming(data) {
    try {
      const obj = JSON.parse(data);
      delete obj.Token;

      let presentationObject = obj;
      if (rule) {
        presentationObject = obj.Body;
      }
      if (compact) {
        console.log(JSON.stringify(presentationObject));
      } else {
        console.log(JSON.stringify(presentationObject, null, 2));
      }
      if (sam) {
        try {
          await lambda
            .invoke({
              FunctionName: obj.Target,
              Payload: JSON.stringify(obj.Body)
            })
            .promise();
        } catch (err) {
          console.log(err);
        }
      }
    } catch {
      console.log(data);
    }
  });

  return ws;
}

async function apiId() {
  const cloudFormation = new AWS.CloudFormation();
  const evbLocalStack = await cloudFormation
    .listStackResources({ StackName: 'evb-local' })
    .promise();
  const apiGatewayId = evbLocalStack.StackResourceSummaries.filter(p => p.LogicalResourceId === 'WebSocket')[0].PhysicalResourceId;
  return apiGatewayId;
}

module.exports = {
  connect,
  apiId
};
