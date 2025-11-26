# AWS SNS Delete Topic

> **⚠️ DESTRUCTIVE ACTION WARNING ⚠️**
>
> **This action permanently deletes SNS topics and all subscriptions.**
>
> - All topic subscriptions will be **permanently deleted**
> - Deletion is **irreversible** and **immediate**
> - All endpoints will **stop receiving notifications**
> - Carefully verify the `topic-arn` parameter before use
> - Consider backing up topic configuration and subscriptions
> - **Test thoroughly in non-production environments first**

A GitHub Action to delete AWS SNS topics. Primarily intended for test workflows and temporary topic cleanup.

## Features

- **Delete topics** - Permanently delete SNS topics (standard or FIFO)
- **Simple integration** - Easy to use in GitHub Actions workflows
- **ARN validation** - Basic validation of topic ARN format

## Prerequisites

Configure AWS credentials before using this action.

### Option 1: AWS Credentials (Production)

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
    aws-region: us-east-1
```

### Option 2: LocalStack (Testing)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: sns
    steps:
      - name: Delete topic in LocalStack
        uses: predictr-io/aws-sns-delete-topic@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          topic-arn: 'arn:aws:sns:us-east-1:000000000000:test-topic'
```

## Usage

### Delete Topic

> **⚠️ WARNING:** This will permanently delete the topic and all its subscriptions.

```yaml
- name: Delete SNS topic
  uses: predictr-io/aws-sns-delete-topic@v0
  with:
    topic-arn: 'arn:aws:sns:us-east-1:123456789012:my-topic'
```

### Delete FIFO Topic

```yaml
- name: Delete FIFO topic
  uses: predictr-io/aws-sns-delete-topic@v0
  with:
    topic-arn: 'arn:aws:sns:us-east-1:123456789012:my-topic.fifo'
```

### Test Workflow Example

Delete temporary test topics after integration tests:

```yaml
name: Integration Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: sns

    steps:
      - uses: actions/checkout@v4

      - name: Create test topic
        id: create
        uses: predictr-io/aws-sns-create-topic@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          topic-name: 'test-topic'

      - name: Run integration tests
        run: |
          export TOPIC_ARN="${{ steps.create.outputs.topic-arn }}"
          npm test

      - name: Clean up test topic
        if: always()
        uses: predictr-io/aws-sns-delete-topic@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          topic-arn: ${{ steps.create.outputs.topic-arn }}
```

## Inputs

### Required Inputs

| Input | Description |
|-------|-------------|
| `topic-arn` | SNS topic ARN to delete (e.g., `arn:aws:sns:us-east-1:123456789012:my-topic`) |

## Outputs

| Output | Description |
|--------|-------------|
| `deleted` | Whether the topic was successfully deleted (`"true"` or `"false"`) |

## Topic ARN Format

### Standard Topic

```
arn:aws:sns:{region}:{account-id}:{topic-name}
```

### FIFO Topic

```
arn:aws:sns:{region}:{account-id}:{topic-name}.fifo
```

You can find your topic ARN in the AWS Console or using AWS CLI:

```bash
aws sns list-topics
```

## Error Handling

The action handles common scenarios:

- **Invalid topic ARN**: Fails with validation error
- **Topic does not exist**: Fails with AWS error
- **AWS permission errors**: Fails with AWS SDK error message
- **Topic ARN format warning**: Warns if ARN doesn't match expected AWS format

## Safety Considerations

> **⚠️ IMPORTANT:** Before using this action, consider:

1. **Subscription Loss**: All subscriptions will be permanently deleted
2. **No Undo**: Topic deletion cannot be reversed
3. **Service Impact**: Applications expecting notifications will stop receiving them
4. **Dependencies**: Verify no services are actively using the topic
5. **Monitoring**: Deletion may trigger CloudWatch alarms or break monitoring
6. **Billing**: Topic deletion stops billing immediately
7. **Testing**: Always test in non-production environments first

### Best Practices

- Use in temporary/test workflows only
- Store topic ARNs in secrets, not hardcoded
- Use `if: always()` for cleanup steps to ensure execution
- Document topic subscriptions before deletion
- Verify topic ARN is correct before running
- Review AWS permissions for delete operations
- Consider exporting subscription configurations first

## Development

### Setup

```bash
git clone https://github.com/predictr-io/aws-sns-delete-topic.git
cd aws-sns-delete-topic
npm install
```

### Scripts

```bash
npm run build      # Build the action
npm run type-check # TypeScript checking
npm run lint       # ESLint
npm run check      # Run all checks
```

## License

MIT
