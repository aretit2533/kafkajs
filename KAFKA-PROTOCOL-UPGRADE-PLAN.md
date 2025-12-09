# Kafka Protocol Upgrade Plan

## Overview
This document outlines the plan to upgrade KafkaJS to support the latest Kafka protocol versions as documented at https://kafka.apache.org/protocol.

## Current State Analysis

### API Keys Currently Implemented
The following API keys are currently defined in `src/protocol/requests/apiKeys.js`:
- Produce (0), Fetch (1), ListOffsets (2), Metadata (3)
- OffsetCommit (8), OffsetFetch (9), FindCoordinator (10)
- JoinGroup (11), Heartbeat (12), LeaveGroup (13), SyncGroup (14)
- DescribeGroups (15), ListGroups (16)
- SaslHandshake (17), ApiVersions (18)
- CreateTopics (19), DeleteTopics (20), DeleteRecords (21)
- InitProducerId (22), OffsetForLeaderEpoch (23)
- AddPartitionsToTxn (24), AddOffsetsToTxn (25), EndTxn (26)
- WriteTxnMarkers (27), TxnOffsetCommit (28)
- DescribeAcls (29), CreateAcls (30), DeleteAcls (31)
- DescribeConfigs (32), AlterConfigs (33)
- AlterReplicaLogDirs (34), DescribeLogDirs (35)
- SaslAuthenticate (36), CreatePartitions (37)
- CreateDelegationToken (38), RenewDelegationToken (39)
- ExpireDelegationToken (40), DescribeDelegationToken (41)
- DeleteGroups (42), ElectPreferredLeaders (43)
- IncrementalAlterConfigs (44), AlterPartitionReassignments (45)
- ListPartitionReassignments (46)
- ConsumerGroupHeartbeat (68) - Recently added for KIP-848

### Missing API Keys (from latest Kafka protocol)
The following API keys need to be added:
- **DescribeQuorum (55)** - Raft quorum management
- **AlterPartition (56)** - Partition alteration
- **UpdateFeatures (57)** - Feature updates
- **Envelope (58)** - Request forwarding
- **DescribeCluster (60)** - Cluster metadata
- **DescribeProducers (61)** - Producer state
- **DescribeTransactions (65)** - Transaction state
- **ListTransactions (66)** - Transaction listing
- **ConsumerGroupDescribe (69)** - Consumer group state (new protocol)
- **DescribeTopicPartitions (75)** - Topic partition details
- **ShareFetch (78)** - Share groups (KIP-932)
- **ShareAcknowledge (79)** - Share group acknowledgment
- **AddRaftVoter (80)** - Raft cluster management
- **RemoveRaftVoter (81)** - Raft cluster management
- **StreamsGroupHeartbeat (88)** - Kafka Streams groups

## Version Upgrade Requirements

### Critical APIs Needing Version Upgrades

#### 1. **Produce API (Key: 0)**
- Current: v0-v7
- Latest: **v13**
- New versions add:
  - v8: Record error batching
  - v9: Flexible versioning (COMPACT types)
  - v10: Same as v9
  - v11-v12: Same as v10
  - v13: Topic ID support (UUID instead of topic name)

#### 2. **Fetch API (Key: 1)**
- Current: v0-v11
- Latest: **v18**
- New versions add:
  - v12: Flexible versioning
  - v13: Topic ID support (UUID)
  - v14: Same as v13
  - v15: Removed replica_id field
  - v16: Same as v15
  - v17: Same as v16
  - v18: Same as v17

#### 3. **ListOffsets API (Key: 2)**
- Current: v0-v5
- Latest: **v9**
- New versions add:
  - v6: Flexible versioning (COMPACT types)
  - v7: Same as v6
  - v8: Same as v7
  - v9: Same as v8

#### 4. **Metadata API (Key: 3)**
- Current: v0-v6
- Latest: **v13**
- New versions add:
  - v7: Leader epoch
  - v8: Authorized operations
  - v9: Flexible versioning
  - v10: Topic ID support
  - v11: Topic ID in request
  - v12: Nullable topic names
  - v13: Top-level error code

#### 5. **OffsetCommit API (Key: 8)**
- Current: v0-v8
- Latest: **v10**
- New versions add:
  - v9: Same as v8
  - v10: Topic ID support

#### 6. **OffsetFetch API (Key: 9)**
- Current: v0-v7
- Latest: **v10**
- New versions add:
  - v8: Batched group requests (multiple groups)
  - v9: Member epoch support (KIP-848)
  - v10: Same as v9

#### 7. **FindCoordinator API (Key: 10)**
- Current: v0-v2
- Latest: **v5**
- New versions add:
  - v3: Flexible versioning
  - v4: Batched requests (multiple coordinators)
  - v5: Same as v4

#### 8. **JoinGroup API (Key: 11)**
- Current: v0-v5
- Latest: **v10**
- New versions add:
  - v6: Flexible versioning
  - v7: Reason field
  - v8: Same as v7
  - v9: Same as v8
  - v10: Same as v9

#### 9. **Heartbeat API (Key: 12)**
- Current: v0-v4
- Latest: **v5**
- New versions add:
  - v5: Same as v4

#### 10. **DescribeGroups API (Key: 15)**
- Current: v0-v3
- Latest: **v6**
- New versions add:
  - v4: Group instance ID
  - v5: Flexible versioning
  - v6: Error message field

#### 11. **ListGroups API (Key: 16)**
- Current: v0-v3
- Latest: **v5**
- New versions add:
  - v4: State filter
  - v5: Type filter (classic vs consumer protocol)

#### 12. **ApiVersions API (Key: 18)**
- Current: v0-v2
- Latest: **v4**
- New versions add:
  - v3: Client software name/version
  - v4: Same as v3

#### 13. **CreateTopics API (Key: 19)**
- Current: v0-v5
- Latest: **v8**
- New versions add:
  - v6: Same as v5
  - v7: Topic ID in response
  - v8: Same as v7

#### 14. **DeleteTopics API (Key: 20)**
- Current: v0-v4
- Latest: **v7**
- New versions add:
  - v5: Error message
  - v6: Topic ID support
  - v7: Same as v6

#### 15. **InitProducerId API (Key: 22)**
- Current: v0-v3
- Latest: **v6**
- New versions add:
  - v4: Same as v3
  - v5: Same as v4
  - v6: Two-phase commit support (enable2pc, keepPreparedTxn)

## Implementation Priority

### Phase 1: Critical Version Upgrades (High Priority)
Focus on APIs most commonly used by clients:
1. **Produce v8-v13** - Add flexible versioning and UUID support
2. **Fetch v12-v18** - Add flexible versioning and UUID support
3. **Metadata v7-v13** - Add leader epoch, topic IDs, error handling
4. **ListOffsets v6-v9** - Add flexible versioning
5. **OffsetCommit v9-v10** - Add topic ID support
6. **OffsetFetch v8-v10** - Add batching and KIP-848 support

### Phase 2: Consumer/Group Protocol Upgrades (Medium Priority)
1. **JoinGroup v6-v10** - Flexible versioning
2. **Heartbeat v5** - Latest version
3. **DescribeGroups v4-v6** - Group instance ID and error messages
4. **ListGroups v4-v5** - State and type filtering
5. **FindCoordinator v3-v5** - Batched requests
6. **ConsumerGroupDescribe (69)** - NEW API for KIP-848

### Phase 3: Admin & Management APIs (Medium Priority)
1. **CreateTopics v6-v8** - Topic IDs
2. **DeleteTopics v5-v7** - Topic IDs and error messages
3. **DescribeCluster (60)** - NEW API
4. **DescribeTopicPartitions (75)** - NEW API
5. **UpdateFeatures (57)** - NEW API

### Phase 4: Transaction & Producer APIs (Low-Medium Priority)
1. **InitProducerId v4-v6** - Two-phase commit
2. **DescribeProducers (61)** - NEW API
3. **DescribeTransactions (65)** - NEW API
4. **ListTransactions (66)** - NEW API

### Phase 5: Advanced Features (Low Priority)
1. **ShareFetch (78)** - NEW API for share groups
2. **ShareAcknowledge (79)** - NEW API
3. **StreamsGroupHeartbeat (88)** - NEW API for Kafka Streams
4. **AddRaftVoter (80)** - NEW API for Raft
5. **RemoveRaftVoter (81)** - NEW API for Raft
6. **DescribeQuorum (55)** - NEW API for Raft

## Technical Requirements

### 1. Flexible Versioning Support
Many v9+ APIs use "flexible" or "compact" encoding:
- `COMPACT_STRING` - Variable-length string with VarInt length
- `COMPACT_NULLABLE_STRING` - Nullable compact string
- `COMPACT_ARRAY` - Array with VarInt length
- `COMPACT_BYTES` - Bytes with VarInt length
- Tagged fields (`_tagged_fields`) - Extensibility mechanism

**Required Changes:**
- Update `src/protocol/encoder.js` to support compact types
- Update `src/protocol/decoder.js` to support compact types
- Add VarInt encoding/decoding (already partially done)

### 2. UUID Support
Topic IDs use UUID type (16 bytes):
- Already implemented in `encoder.js` (writeUUID)
- Already implemented in `decoder.js` (readUUID)
- Needs to be integrated into newer protocol versions

### 3. Header Versioning
- Request Header v0: Used by older protocols
- Request Header v1: Standard header
- Request Header v2: Flexible header with tagged fields
- Response Header v0: Standard response header
- Response Header v1: Flexible response header with tagged fields

**Required Changes:**
- Update request/response header handling for v2 headers
- Support tagged fields in headers

## Implementation Guidelines

### File Structure
Each API should follow this structure:
```
src/protocol/requests/<apiName>/
  index.js          # Version dispatcher
  v0/
    request.js      # Request encoder
    response.js     # Response decoder
  v1/
    request.js
    response.js
  ...
  vN/
    request.js
    response.js
```

### Version Dispatcher Pattern
```javascript
const versions = {
  0: (params) => {
    const request = require('./v0/request')
    const response = require('./v0/response')
    return { request: request(params), response }
  },
  // ... more versions
}

module.exports = {
  versions: Object.keys(versions),
  protocol: ({ version }) => versions[version],
}
```

### Compact Type Encoding Example
```javascript
// COMPACT_STRING encoding
encoder.writeVarIntString(value)  // Need to implement

// COMPACT_ARRAY encoding
encoder.writeVarIntArray(array, itemEncoder)  // Need to implement

// Tagged fields
encoder.writeTaggedFields(taggedFields)  // Need to implement
```

## Testing Requirements

### 1. Unit Tests
- Test each protocol version encoder/decoder
- Test backwards compatibility
- Test flexible vs non-flexible versions

### 2. Integration Tests
- Test against different Kafka broker versions:
  - 2.8.x (older protocol)
  - 3.x.x (mixed protocol)
  - 4.0+ (latest protocol with KIP-848)

### 3. Compatibility Tests
- Ensure older clients can still work
- Ensure version negotiation works correctly

## Documentation Updates

### 1. CHANGELOG.md
Document all new API versions and features

### 2. README.md
Update supported Kafka versions

### 3. API Documentation
- Document new APIs
- Document version differences
- Migration guides for breaking changes

## Timeline Estimate

- **Phase 1**: 3-4 weeks (Critical APIs)
- **Phase 2**: 2-3 weeks (Consumer/Group)
- **Phase 3**: 2-3 weeks (Admin APIs)
- **Phase 4**: 1-2 weeks (Transactions)
- **Phase 5**: 2-3 weeks (Advanced Features)

**Total**: 10-15 weeks for complete upgrade

## Immediate Next Steps

1. ✅ Create this upgrade plan document
2. Implement compact type encoding support
3. Add Produce v8-v13 support
4. Add Fetch v12-v18 support
5. Add Metadata v7-v13 support
6. Update test suite
7. Test against Kafka 3.x and 4.x brokers

## References

- [Kafka Protocol Guide](https://kafka.apache.org/protocol)
- [KIP-848: Consumer Rebalance Protocol](https://cwiki.apache.org/confluence/x/OhMyBw)
- [KIP-482: Tagged Fields](https://cwiki.apache.org/confluence/x/OhMyBw)
- [KIP-516: Topic IDs](https://cwiki.apache.org/confluence/display/KAFKA/KIP-516%3A+Topic+Identifiers)
