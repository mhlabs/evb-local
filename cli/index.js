#!/usr/bin/env node

const AWS = require('aws-sdk');
const program = require('commander');
const ssoAuth = require('@mhlabs/aws-sso-client-auth');
const storage = require('node-persist');
const os = require('os');

const stackListener = require('./listeners/stackListener');
const localPatternListener = require('./listeners/localPatternListener');
const arnListener = require('./listeners/arnListener');

const EVB_CACHE_DIR = `${os.homedir()}/.evb-local`;

program.version('1.0.3', '-v, --vers', 'output the current version');
program
  .command('listen [StackName]')
  .alias('l')
  .option('-c, --compact [compact]', 'Output compact JSON on one line', 'false')
  .option('-s, --sam-local [sam]', 'Send requests to sam-local', 'false')
  .description("Initiates local consumption of a stack's EventBridge rules")
  .action(async (stackName, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }

    await authenticate();
    await stackListener.init(
      stackName,
      cmd.compact.toLowerCase() === 'true',
      cmd.samLocal.toLowerCase() === 'true'
    );
  });

program
  .command('rule-arn [arn]')
  .alias('a')
  .option('-c, --compact [compact]', 'Output compact JSON on one line', 'false')
  .description("Initiates local consumption of a rule ARN")
  .action(async (ruleArn, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }
    await authenticate();
    await arnListener.init(
      ruleArn,
      cmd.target,
      cmd.compact.toLowerCase() === 'true',
      false
    );
  });

program
  .command('test-rule [RuleName]')
  .alias('t')
  .option(
    '-t, --template-file [templateFile]',
    'Path to template file',
    'template.yml'
  )
  .option('-c, --compact [compact]', 'Output compact JSON on one line', 'false')
  .option('-s, --sam-local [sam]', 'Send requests to sam-local', 'false')
  .description('Initiates local consumption of an undeployed EventBridge rule')
  .action(async (ruleName, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }

    await authenticate();
    await localPatternListener.init(
      ruleName,
      cmd.templateFile,
      cmd.compact.toLowerCase() === 'true',
      cmd.samLocal.toLowerCase() === 'true'
    );
  });

program
  .command('configure-sso')
  .option('-a, --account-id <accountId>', 'Account ID')
  .option('-u, --start-url <startUrl>', 'AWS SSO start URL')
  .option('--region <region>', 'AWS region')
  .option('--role <role>', 'Role to get credentials for')
  .description('Configure authentication with AWS Single Sign-On')
  .action(async cmd => {
    await storage.init({
      dir: EVB_CACHE_DIR,
      expiredInterval: 0
    });

    await storage.setItem('evb-cli-sso', {
      accountId: cmd.accountId,
      startUrl: cmd.startUrl,
      region: cmd.region,
      role: cmd.role
    });
  });
program.on('command:*', () => {
  const command = program.args[0];

  console.error(`Unknown command '${command}'`);
  process.exit(1);
});

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}
async function authenticate() {
  await storage.init({
    dir: EVB_CACHE_DIR
  });
  const ssoConfig = await storage.getItem('evb-cli-sso');
  if (ssoConfig) {
    await ssoAuth.configure({
      clientName: 'evb-cli',
      startUrl: ssoConfig.startUrl,
      accountId: ssoConfig.accountId,
      region: ssoConfig.region
    });
    AWS.config.update({
      credentials: await ssoAuth.authenticate(ssoConfig.role)
    });
  }
}
