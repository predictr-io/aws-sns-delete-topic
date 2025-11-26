import {
  SNSClient,
  DeleteTopicCommand
} from '@aws-sdk/client-sns';
import * as core from '@actions/core';

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Validate topic ARN format
 */
export function validateTopicArn(topicArn: string): void {
  if (!topicArn || topicArn.trim().length === 0) {
    throw new Error('Topic ARN cannot be empty');
  }

  // Check if it looks like an SNS topic ARN
  if (!topicArn.startsWith('arn:aws:sns:')) {
    core.warning(
      `Topic ARN "${topicArn}" does not appear to be a valid AWS SNS topic ARN. ` +
      'Expected format: arn:aws:sns:<region>:<account-id>:<topic-name>'
    );
  }
}

/**
 * Delete an SNS topic
 */
export async function deleteTopic(
  client: SNSClient,
  topicArn: string
): Promise<DeleteResult> {
  try {
    // Validate input
    validateTopicArn(topicArn);

    core.info(`Deleting topic: ${topicArn}`);

    // Delete topic
    const command = new DeleteTopicCommand({
      TopicArn: topicArn
    });

    await client.send(command);

    core.info('✓ Topic deleted successfully');

    return {
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Failed to delete topic: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
}
