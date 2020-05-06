# evb-local

Tool that lets you subscribe locally to events matching EventBridge rules in a given deployed stack. This is to help with debugging of complex flow of events raised in your applicaton.

![Demo](https://raw.githubusercontent.com/mhlabs/evb-local/master/demo.gif)

## Backend setup (once per AWS account)
1. Make sure you have either `aws-cli` or `sam-cli` installed.
2. Clone this repo
3. Go to the `./sam`-folder
4. `npm -i --only=prod`
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

1. Install CLI
`npm install -g @mhlabs/evb-local`

## Usage
```
 evb-local [options] [command]

Options:
  -v, --vers                      output the current version
  -h, --help                      display help for command

Commands:
  listen|l [options] [stackName]  Initiates local consumption of a stacks EventBridge rules
  configure-sso [options]         Configure authentication with AWS Single Sign-On
  help [command]                  display help for command
```

## Usage of `listen` command
```
Usage: evb-local listen|l [options] [stackName]

Initiates local consumption of a stacks EventBridge rules

Options:
  -c, --compact [compact]  Output compact JSON on one line (default: "false")
  -s, --sam-local [sam]    Send requests to sam-local (default: "false")
  --sso                    Authenticate with AWS SSO. Set environment variable EVB_CLI_SSO=1 for
                           default behaviour
  -h, --help               display help for command
```

### Example output
```
{
  "Target": <RuleTarget>,
  "Body": {
    <EventPayload>
  }
}

```

Where:
* `RuleTarget` is the name identifier of the EventBridge rule's target. If this exists in the same stack it will display the CloudFromation LogicalID
* `EventPayload` is the payload of the event
