# evb-local

Tool that lets you subscribe locally to events matching EventBridge rules in a given deployed stack. This is to help with debugging of complex flow of events raised in your applicaton.

## Backend setup (once per AWS account)
1. Make sure you have either `aws-cli` or `sam-cli` installed.
2. Clone this repo
3. Go to the `./sam`-folder
4. `npm i --only=prod`
5. Deploy template.yaml
   `sam deploy -t template.yaml --guided --stack-name evb-local`

## CLI setup

Prerequisites:
* Valid AWS credentials that at the least has permissions to do the following (or an SSO role configured with at least the same):
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "cloudformation:ListStackResources"
      ],
      "Resource": [
        "arn:aws:cloudformation:<region>:<accountid>:stack/evb-local",
        "arn:aws:cloudformation:<region>:<accountid>:stack/evb-local/*"
      ]
    }
  ]
}
```

Install CLI
`npm install -g @mhlabs/evb-local`

## Usage
```
Usage: index listen|l [options] [StackName]

Initiates local consumption of a stack's EventBridge rules

Options:
  -c, --compact [compact]  Output compact JSON on one line (default: "false")
  -s, --sam-local [sam]    Send requests to sam-local (default: "false")
  -p, --profile [profile]  AWS profile to use
  -h, --help               display help for command
```

## Usage of `listen` command
This command can be used to create alocal consumer of all deployed EventBrudge rule in a stack. The events will be outputed in your console with the option to pass them on to sam-local for local debugging.

![Demo](https://raw.githubusercontent.com/mhlabs/evb-local/master/demo.gif)

```
Usage: evb-local listen|l [options] [stackName]

Initiates local consumption of a stacks EventBridge rules

Options:
  -c, --compact [compact]  Output compact JSON on one line (default: "false")
  -s, --sam-local [sam]    Send requests to sam-local (default: "false")
  -h, --help               display help for command
```

## Usage of `test-rule` command
This command can be used to quickly test rules from you SAM/CloudFormation template before deploying it. The matching events will be outputed instantly in your console with the option to pass them on to sam-local for local debugging.

![Demo](https://raw.githubusercontent.com/mhlabs/evb-local/master/demo2.gif)


```
Usage: evb-local test-rule|t [options] [RuleName]

Initiates local consumption of an undeployed EventBridge rule

Options:
  -t, --template-file [templateFile]  Path to template file (default: "template.yml")
  -c, --compact [compact]             Output compact JSON on one line (default: "false")
  -s, --sam-local [sam]               Send requests to sam-local (default: "false")
  -h, --help                          display help for command
```

## Usage of `rule-arn` command
This command can be used to consume the events matching the targets of a specific rule arn. If there are more than one target of the rule, then a payload of each target will be presented together with the target ARN.

![Demo](https://raw.githubusercontent.com/mhlabs/evb-local/master/demo3.gif)
In the above example `arn:aws:events:eu-west-1:123456789012:rule/codepipeline-change-state` has the following rule:
```
{
  "source": [
    "aws.codepipeline"
  ],
  "detail-type": [
    "CodePipeline Stage Execution State Change"
  ],
  "detail": {
    "state": [
      "FAILED",
      "STARTED",
      "SUCCEEDED"
    ]
  }
}
```
When the connection is established, each state transition gets outputted locally.


```
Usage: evb-local rule-arn|a [options] [arn]

Initiates local consumption of a rule ARN

Options:
  -c, --compact [compact]  Output compact JSON on one line (default: "false")
  -h, --help               display help for command
```

### Example output
```
{
  "Target": <RuleTargetArn>,
  "Body": {
    <EventPayload>
  }
}

```

Where:
* `RuleTargetArn` is the ARN of the event's target. 
* `EventPayload` is the payload of the event
