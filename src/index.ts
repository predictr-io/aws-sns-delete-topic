import * as core from '@actions/core';
import { SNSClient } from '@aws-sdk/client-sns';
import { deleteTopic } from './sns';

async function run(): Promise<void> {
  try {
    // Get inputs
    const topicArn = core.getInput('topic-arn', { required: true });

    core.info('AWS SNS Delete Topic');
    core.info(`Topic ARN: ${topicArn}`);

    // Create SNS client (uses AWS credentials from environment)
    const client = new SNSClient({});

    // Delete topic
    const result = await deleteTopic(client, topicArn);

    // Handle result
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete topic');
    }

    // Set outputs
    core.setOutput('deleted', 'true');

    // Summary
    core.info('');
    core.info('='.repeat(50));
    core.info('Topic deleted successfully');
    core.info(`Topic ARN: ${topicArn}`);
    core.info('='.repeat(50));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
  }
}

run();
