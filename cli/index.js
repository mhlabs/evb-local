#!/usr/bin/env node

const AWS = require('aws-sdk');
const program = require('commander');
const inquirer = require('inquirer');
const stackListener = require('./listeners/stackListener');
const localPatternListener = require('./listeners/localPatternListener');
const arnListener = require('./listeners/arnListener');
const prompt = inquirer.createPromptModule();
require('@mhlabs/aws-sdk-sso');

program.version('1.0.8', '-v, --vers', 'output the current version');
program
  .command('listen [StackName]')
  .alias('l')
  .option('-c, --compact [compact]', 'Output compact JSON on one line', 'false')
  .option('-s, --sam-local [sam]', 'Send requests to sam-local', 'false')
  .option("-p, --profile [profile]", "AWS profile to use")
  .description("Initiates local consumption of a stack's EventBridge rules")
  .action(async (stackName, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }

    await authenticate(cmd.profile);
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
  .option("-p, --profile [profile]", "AWS profile to use")
  .description("Initiates local consumption of a rule ARN")
  .action(async (ruleArn, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }
    await authenticate(cmd.profile);
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
  .option("-p, --profile [profile]", "AWS profile to use")
  .description('Initiates local consumption of an undeployed EventBridge rule')
  .action(async (ruleName, cmd) => {
    if (!process.env.AWS_REGION) {
      console.log(
        'Please set environment variable AWS_REGION to your desired region. I.e us-east-1'
      );
      return;
    }

    await authenticate(cmd.profile);
    await localPatternListener.init(
      ruleName,
      cmd.templateFile,
      cmd.compact.toLowerCase() === 'true',
      cmd.samLocal.toLowerCase() === 'true'
    );
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
async function authenticate(profile) {
  process.env.AWS_PROFILE = profile || process.env.AWS_PROFILE || "default";
  AWS.config.credentialProvider.providers.unshift(
    new AWS.SingleSignOnCredentials()
  );
}
