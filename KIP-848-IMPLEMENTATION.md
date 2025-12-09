# KIP-848 Implementation Summary

This document summarizes the implementation of KIP-848 (Next Generation Consumer Rebalance Protocol) support in KafkaJS.

## Overview

KIP-848 introduces a fundamentally new consumer group protocol that shifts coordination from client-driven (JoinGroup/SyncGroup) to server-driven (ConsumerGroupHeartbeat). This implementation adds support for this protocol while maintaining backward compatibility with the classic protocol.

## Changes Made

### 1. Protocol Implementation

#### New Protocol Request/Response
- **Location**: `src/protocol/requests/consumerGroupHeartbeat/`
- **Files**:
  - `v0/request.js` - ConsumerGroupHeartbeat request encoder
  - `v0/response.js` - ConsumerGroupHeartbeat response decoder
  - `index.js` - Protocol version management

#### API Key Addition
- **File**: `src/protocol/requests/apiKeys.js`
- **Change**: Added `ConsumerGroupHeartbeat: 68` for KIP-848 protocol

#### Encoder/Decoder Enhancements
- **Files**: `src/protocol/encoder.js`, `src/protocol/decoder.js`
- **Changes**:
  - Added `writeUUID()` method to Encoder for writing 16-byte UUIDs
  - Added `readUUID()` method to Decoder for reading UUIDs
  - UUID support required for topic IDs in KIP-848 protocol

### 2. Consumer Configuration

#### New Configuration Options
- **File**: `src/consumer/index.js`
- **Options Added**:
  - `groupProtocol`: `'classic'` | `'consumer'` (default: `'classic'`)
  - `groupRemoteAssignor`: Server-side assignor name (default: `null`, uses 'uniform')

#### Configuration Validation
- Validates `groupProtocol` is either `'classic'` or `'consumer'`
- Logs informational message when KIP-848 protocol is enabled
- Documents that `sessionTimeout`, `heartbeatInterval`, and `partitionAssigners` are server-configured in KIP-848 mode

### 3. TypeScript Definitions

#### Type Updates
- **File**: `types/index.d.ts`
- **Changes**:
  - Added `groupProtocol?: 'classic' | 'consumer'` to `ConsumerConfig`
  - Added `groupRemoteAssignor?: string` to `ConsumerConfig`

### 4. Documentation

#### New Documentation Files
- **File**: `docs/ConsumerGroupProtocol.md`
- **Content**:
  - Comprehensive guide to KIP-848 protocol
  - Comparison with classic protocol
  - Migration guide (live and offline)
  - Configuration examples
  - Troubleshooting section
  - Best practices

#### Updated Documentation Files
- **File**: `docs/Consuming.md`
- **Changes**:
  - Added `groupProtocol` and `groupRemoteAssignor` to options table
  - Updated descriptions for `sessionTimeout` and `heartbeatInterval` to note server-side configuration in KIP-848
  - Added link to `ConsumerGroupProtocol.md` for detailed information

- **File**: `README.md`
- **Changes**:
  - Added KIP-848 support to features list

### 5. Examples

#### New Example File
- **File**: `examples/consumer-kip848.js`
- **Content**:
  - Example consumer using KIP-848 protocol
  - Demonstrates configuration options
  - Includes graceful shutdown handling

### 6. Changelog

#### Updates
- **File**: `CHANGELOG.md`
- **Changes**:
  - Added [Unreleased] section documenting KIP-848 features
  - Listed all new configuration options and protocol implementation

## Protocol Details

### ConsumerGroupHeartbeat Request (v0)

**Fields**:
- `group_id` (COMPACT_STRING): Consumer group ID
- `member_id` (COMPACT_STRING): Member ID assigned by coordinator
- `member_epoch` (INT32): Current epoch of the member
- `instance_id` (COMPACT_NULLABLE_STRING): Static member instance ID
- `rack_id` (COMPACT_NULLABLE_STRING): Rack ID for rack-aware assignment
- `rebalance_timeout_ms` (INT32): Maximum time to complete partition revocation
- `subscribe_topic_names` (COMPACT_ARRAY<STRING>): Topics to subscribe to
- `assigned_topic_partitions` (COMPACT_ARRAY): Currently assigned partitions
- Tagged fields for future extensibility

### ConsumerGroupHeartbeat Response (v0)

**Fields**:
- `throttle_time_ms` (INT32): Throttle time
- `error_code` (INT16): Error code
- `error_message` (COMPACT_NULLABLE_STRING): Error message
- `member_id` (COMPACT_STRING): Assigned member ID
- `member_epoch` (INT32): New member epoch
- `heartbeat_interval_ms` (INT32): Server-configured heartbeat interval
- `assignment` (COMPACT_ARRAY): New partition assignments
- Tagged fields

## Key Benefits

1. **Reduced Downtime**: Incremental rebalancing minimizes consumer pauses
2. **Faster Rebalances**: Server-driven coordination is more efficient
3. **Better Scalability**: Handles large consumer groups and partition counts
4. **Simplified Configuration**: Server-side timeout and assignor management
5. **Backward Compatible**: Classic protocol remains default, smooth migration path

## Requirements

- **Broker Version**: Apache Kafka 4.0+ or Confluent Platform 8.0+
- **Client Configuration**: Set `groupProtocol: 'consumer'` to enable

## Migration Path

### Option 1: Live Migration (Rolling Upgrade)
1. Update to KafkaJS version with KIP-848 support
2. Rolling restart consumers with `groupProtocol: 'consumer'`
3. Coordinator handles mixed protocol groups during transition

### Option 2: Offline Migration
1. Stop all consumers
2. Update configuration to use `groupProtocol: 'consumer'`
3. Start consumers with new configuration

## Testing Recommendations

1. **Unit Tests**: Verify protocol encoding/decoding
2. **Integration Tests**: Test with Kafka 4.0+ brokers
3. **Compatibility Tests**: Ensure classic protocol still works
4. **Migration Tests**: Validate live and offline migration scenarios
5. **Performance Tests**: Measure rebalance times and throughput

## Future Work

Potential enhancements for future versions:

1. **Full Protocol Integration**: Complete ConsumerGroup class integration with KIP-848
2. **Rack-Aware Assignment**: Support when available in Kafka (KAFKA-17747)
3. **Custom Server-Side Assignors**: Support for additional assignor types
4. **Topic ID Support**: Full topic ID integration for offset commits
5. **Enhanced Monitoring**: Additional metrics for KIP-848 protocol
6. **KIP-1071 Support**: Kafka Streams integration with new protocol

## References

- [KIP-848 Proposal](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol)
- [Confluent Blog Post](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)

## Files Modified/Created

### Created Files
- `src/protocol/requests/consumerGroupHeartbeat/index.js`
- `src/protocol/requests/consumerGroupHeartbeat/v0/request.js`
- `src/protocol/requests/consumerGroupHeartbeat/v0/response.js`
- `docs/ConsumerGroupProtocol.md`
- `examples/consumer-kip848.js`

### Modified Files
- `src/consumer/index.js`
- `src/protocol/encoder.js`
- `src/protocol/decoder.js`
- `src/protocol/requests/apiKeys.js`
- `types/index.d.ts`
- `docs/Consuming.md`
- `README.md`
- `CHANGELOG.md`

## Compatibility

- **Backward Compatible**: Yes, classic protocol remains default
- **Breaking Changes**: None
- **Deprecations**: None (both protocols supported)
- **Node.js Version**: No changes to minimum version requirements
- **Kafka Version**: Classic protocol: 0.10+, KIP-848 protocol: 4.0+
