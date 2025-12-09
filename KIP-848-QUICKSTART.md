# KIP-848 Quick Start Guide

## What is KIP-848?

KIP-848 introduces the next generation consumer rebalance protocol for Apache Kafka. It replaces the classic client-driven JoinGroup/SyncGroup coordination with a server-driven ConsumerGroupHeartbeat mechanism.

## Quick Migration

### Before (Classic Protocol)
```javascript
const consumer = kafka.consumer({
  groupId: 'my-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  partitionAssigners: [PartitionAssigners.roundRobin]
})
```

### After (KIP-848 Protocol)
```javascript
const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer', // Enable KIP-848
  groupRemoteAssignor: 'uniform', // Optional, defaults to 'uniform'
  rebalanceTimeout: 60000,
})
```

## Key Changes

1. **Add `groupProtocol: 'consumer'`** - Enables KIP-848
2. **Remove `sessionTimeout` and `heartbeatInterval`** - Now server-configured
3. **Remove `partitionAssigners`** - Use `groupRemoteAssignor` instead
4. **Keep `rebalanceTimeout`** - Still used for partition revocation timing

## Benefits

✅ **Faster rebalances** - Server-driven coordination is more efficient  
✅ **Less downtime** - Incremental changes instead of stop-the-world  
✅ **Better scalability** - Handles large groups and partition counts  
✅ **Simpler config** - Less client-side configuration needed

## Requirements

- Apache Kafka 4.0+ or Confluent Platform 8.0+
- KafkaJS with KIP-848 support

## Server-Side Assignors

- `uniform` - Evenly distributes partitions (default)
- `range` - Range-based assignment per topic

## Example

```javascript
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer', // KIP-848 enabled
})

await consumer.connect()
await consumer.subscribe({ topics: ['my-topic'] })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log(message.value.toString())
  },
})
```

## Full Documentation

See [Consumer Group Protocol Documentation](docs/ConsumerGroupProtocol.md) for complete details.
