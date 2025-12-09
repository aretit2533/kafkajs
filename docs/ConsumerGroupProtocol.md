# Consumer Group Protocol (KIP-848)

KafkaJS now supports the new consumer group protocol introduced in [KIP-848](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol), also known as the "next generation" consumer rebalance protocol. This protocol is available in Apache Kafka 4.0+ and provides significant improvements over the classic consumer group protocol.

## Overview

The new consumer group protocol (KIP-848) fundamentally redesigns how consumers coordinate partition assignments, shifting from a client-driven approach to a server-driven model. This results in:

- **Reduced/eliminated consumer downtime** during rebalances
- **Faster rebalances** through incremental, server-side coordination
- **Improved stability and scalability** for large consumer groups
- **Simplified configuration** with server-side parameter management

## Key Differences from Classic Protocol

| Aspect | Classic Protocol | KIP-848 Protocol |
|--------|-----------------|------------------|
| **Coordination** | Client-driven (JoinGroup/SyncGroup) | Server-driven (ConsumerGroupHeartbeat) |
| **Rebalance Impact** | Stop-the-world for all consumers | Incremental, affecting only necessary consumers |
| **Assignment Logic** | Client-side partition assigners | Server-side assignors |
| **Heartbeats** | Separate Heartbeat requests | Integrated in ConsumerGroupHeartbeat |
| **Configuration** | Client-configured timeouts | Server-configured session/heartbeat intervals |

## Usage

### Basic Configuration

To use the new consumer group protocol, set `groupProtocol: 'consumer'` in your consumer configuration:

```javascript
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
})

const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer', // Enable KIP-848 protocol
})

await consumer.connect()
await consumer.subscribe({ topic: 'my-topic' })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      value: message.value.toString(),
    })
  },
})
```

### Server-Side Assignor Configuration

The new protocol uses server-side assignors instead of client-side partition assigners. You can specify the assignor using the `groupRemoteAssignor` option:

```javascript
const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer',
  groupRemoteAssignor: 'uniform', // or 'range'
})
```

**Available Server-Side Assignors:**
- `uniform` (default): Distributes partitions evenly across consumers
- `range`: Assigns partitions based on ranges within topics

> **Note:** The `partitionAssigners` option is ignored when using `groupProtocol: 'consumer'`, as partition assignment is handled server-side.

## Requirements

### Kafka Cluster Version

The new consumer group protocol requires:
- Apache Kafka 4.0 or later
- Confluent Platform 8.0 or later
- Confluent Cloud (always supported)

### Configuration Changes

When migrating from the classic protocol, be aware of the following changes:

#### Deprecated Client-Side Options

The following options are now configured server-side and should be removed from your client configuration:

- `sessionTimeout` - Now configured on the broker via `group.consumer.session.timeout.ms`
- `heartbeatInterval` - Now configured on the broker via `group.consumer.heartbeat.interval.ms`
- `partitionAssigners` - Replaced by server-side `groupRemoteAssignor`

#### Retained Client-Side Options

These options continue to work with the new protocol:

- `rebalanceTimeout` - Mapped to the protocol's rebalance timeout
- `maxBytesPerPartition`, `minBytes`, `maxBytes`, `maxWaitTimeInMs` - Fetching behavior unchanged
- `rackId` - Used for rack-aware assignment (when supported by assignor)

## Migration Guide

### Live Migration (Rolling Upgrade)

The new protocol supports live migration from classic consumer groups:

1. **Update KafkaJS** to the version supporting KIP-848
2. **Rolling restart** consumer instances with `groupProtocol: 'consumer'`
3. The coordinator automatically handles mixed-protocol groups during transition

```javascript
// Old configuration (classic protocol)
const consumer = kafka.consumer({
  groupId: 'my-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  partitionAssigners: [PartitionAssigners.roundRobin]
})

// New configuration (KIP-848 protocol)
const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer',
  groupRemoteAssignor: 'uniform', // Optional, defaults to 'uniform'
  rebalanceTimeout: 60000,
})
```

> **Important:** Live migration is intended for temporary scenarios only. Do not run mixed-protocol consumer groups in production long-term.

### Offline Migration

For a clean migration:

1. Stop all consumers in the group
2. Update consumer configuration to use `groupProtocol: 'consumer'`
3. Start consumers with new configuration

## Benefits in Detail

### Reduced Downtime

With the classic protocol, any membership change causes all consumers to revoke all partitions, wait for reassignment, and then resume. The new protocol allows:

- Consumers to continue processing partitions unaffected by the rebalance
- Only affected consumers pause for partition revocation/assignment
- No group-wide synchronization barriers

### Faster Rebalances

Server-driven coordination eliminates multiple round-trips:

- **Classic**: JoinGroup → SyncGroup → (potentially multiple rounds) → Resume
- **KIP-848**: Incremental heartbeat-driven reconciliation with immediate partial resumption

### Improved Scalability

The server-side approach scales better with:

- Large numbers of partitions (1000s per group)
- Large consumer groups (100s of members)
- Multi-threaded broker coordination
- Efficient state management on the coordinator

## Monitoring and Observability

The new protocol provides enhanced monitoring capabilities through the same instrumentation events, with additional metadata:

```javascript
const consumer = kafka.consumer({
  groupId: 'my-group',
  groupProtocol: 'consumer',
})

consumer.on(consumer.events.GROUP_JOIN, async ({ payload }) => {
  console.log('Group join event:', payload)
  // Includes member epoch, assignment details
})

consumer.on(consumer.events.HEARTBEAT, async ({ payload }) => {
  console.log('Heartbeat event:', payload)
  // Integrated with assignment reconciliation
})
```

## Limitations and Considerations

### Current Limitations

1. **Rack-aware assignment**: Not yet fully supported in initial implementations (see KAFKA-17747)
2. **Custom assignors**: Only standard server-side assignors (`uniform`, `range`) are available
3. **Compatibility**: Requires Kafka 4.0+ brokers

### Best Practices

1. **Use for new deployments**: Recommended for all new consumer groups on compatible clusters
2. **Monitor during migration**: Watch rebalance metrics during rolling upgrades
3. **Test thoroughly**: Validate behavior in staging environments before production rollout
4. **Plan broker upgrades**: Ensure your Kafka cluster supports KIP-848 before enabling

## Troubleshooting

### Common Issues

**Error: "Consumer groupProtocol must be either 'classic' or 'consumer'"**
- Solution: Ensure `groupProtocol` is set to either `'classic'` or `'consumer'`

**Consumers not receiving assignments**
- Check broker version compatibility (Kafka 4.0+)
- Verify broker-side assignor configuration
- Review broker logs for coordinator errors

**Rebalances taking longer than expected**
- Check `rebalanceTimeout` configuration
- Monitor broker CPU and coordination thread pool
- Review assignment complexity (number of partitions/consumers)

## Examples

### Consumer with Auto-Offset Management

```javascript
const consumer = kafka.consumer({
  groupId: 'auto-offset-group',
  groupProtocol: 'consumer',
})

await consumer.connect()
await consumer.subscribe({ topics: ['orders', 'payments'] })

await consumer.run({
  autoCommit: true,
  eachMessage: async ({ topic, partition, message }) => {
    console.log(`Processing ${topic}[${partition}]: ${message.value}`)
  },
})
```

### Consumer with Manual Offset Control

```javascript
const consumer = kafka.consumer({
  groupId: 'manual-offset-group',
  groupProtocol: 'consumer',
  rebalanceTimeout: 120000,
})

await consumer.connect()
await consumer.subscribe({ topic: 'critical-events' })

await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    try {
      await processMessage(message)
      await consumer.commitOffsets([
        { topic, partition, offset: (parseInt(message.offset) + 1).toString() }
      ])
    } catch (error) {
      console.error('Processing failed:', error)
    }
  },
})
```

### Batch Processing with KIP-848

```javascript
const consumer = kafka.consumer({
  groupId: 'batch-processor',
  groupProtocol: 'consumer',
  maxBytesPerPartition: 2 * 1024 * 1024, // 2MB per partition
})

await consumer.connect()
await consumer.subscribe({ topic: 'analytics-events' })

await consumer.run({
  eachBatch: async ({ 
    batch, 
    resolveOffset, 
    heartbeat, 
    isRunning, 
    isStale 
  }) => {
    for (let message of batch.messages) {
      if (!isRunning() || isStale()) break
      
      await processBatchMessage(message)
      resolveOffset(message.offset)
      await heartbeat()
    }
  },
})
```

## Future Enhancements

The KIP-848 protocol provides a foundation for future improvements:

- **KIP-1071**: Kafka Streams integration with the new protocol
- **Enhanced assignors**: Rack-aware and custom server-side assignor support
- **Topic ID support**: Full integration with topic IDs for offset commits and fetching

## References

- [KIP-848: The Next Generation of the Consumer Rebalance Protocol](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol)
- [Confluent Blog: Introducing KIP-848](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
- [Apache Kafka 4.0 Release Notes](https://kafka.apache.org/)
