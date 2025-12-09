# Kafka Protocol Version Support - Quick Reference

## Current Implementation Status (December 2025)

### Encoder/Decoder Foundation
✅ **COMPLETE** - All compact type support ready for Kafka 2.4+ flexible versioning

### API Version Support Matrix

| API | Current Max Version | Latest Kafka Version | Status | Priority |
|-----|-------------------|---------------------|--------|----------|
| **Produce (0)** | v7 | v13 | 🟡 Needs v8-v13 | HIGH |
| **Fetch (1)** | v11 | v18 | 🟡 Needs v12-v18 | HIGH |
| **ListOffsets (2)** | v5 | v9 | 🟡 Needs v6-v9 | HIGH |
| **Metadata (3)** | v6 | v13 | 🟡 Needs v7-v13 | HIGH |
| **OffsetCommit (8)** | v8 | v10 | 🟡 Needs v9-v10 | HIGH |
| **OffsetFetch (9)** | v7 | v10 | 🟡 Needs v8-v10 | HIGH |
| **FindCoordinator (10)** | v2 | v5 | 🟡 Needs v3-v5 | MEDIUM |
| **JoinGroup (11)** | v5 | v10 | 🟡 Needs v6-v10 | MEDIUM |
| **Heartbeat (12)** | v4 | v5 | 🟡 Needs v5 | MEDIUM |
| **SyncGroup (14)** | v4 | v5 | 🟡 Needs v5 | MEDIUM |
| **DescribeGroups (15)** | v3 | v6 | 🟡 Needs v4-v6 | MEDIUM |
| **ListGroups (16)** | v3 | v5 | 🟡 Needs v4-v5 | MEDIUM |
| **ApiVersions (18)** | v2 | v4 | 🟡 Needs v3-v4 | MEDIUM |
| **CreateTopics (19)** | v5 | v8 | 🟡 Needs v6-v8 | MEDIUM |
| **DeleteTopics (20)** | v4 | v7 | 🟡 Needs v5-v7 | MEDIUM |
| **InitProducerId (22)** | v3 | v6 | 🟡 Needs v4-v6 | MEDIUM |
| **ConsumerGroupHeartbeat (68)** | v0 | v0 | ✅ Complete | - |

### Missing APIs (NEW)

| API | Key | Purpose | Priority |
|-----|-----|---------|----------|
| **DescribeQuorum** | 55 | Raft quorum management | LOW |
| **AlterPartition** | 56 | Partition alteration | MEDIUM |
| **UpdateFeatures** | 57 | Feature updates | MEDIUM |
| **Envelope** | 58 | Request forwarding | LOW |
| **DescribeCluster** | 60 | Cluster metadata | MEDIUM |
| **DescribeProducers** | 61 | Producer state | MEDIUM |
| **DescribeTransactions** | 65 | Transaction state | MEDIUM |
| **ListTransactions** | 66 | Transaction listing | MEDIUM |
| **ConsumerGroupDescribe** | 69 | Consumer group state (KIP-848) | MEDIUM |
| **DescribeTopicPartitions** | 75 | Topic partition details | MEDIUM |
| **ShareFetch** | 78 | Share groups (KIP-932) | LOW |
| **ShareAcknowledge** | 79 | Share group ack | LOW |
| **AddRaftVoter** | 80 | Raft cluster mgmt | LOW |
| **RemoveRaftVoter** | 81 | Raft cluster mgmt | LOW |
| **StreamsGroupHeartbeat** | 88 | Kafka Streams groups | LOW |

## Key Protocol Features by Version

### Kafka 0.10.x - 0.11.x
- Basic protocol versions (v0-v3 for most APIs)
- Transactions support introduced

### Kafka 1.x - 2.3.x
- Incremental protocol improvements
- Additional metadata and admin APIs

### Kafka 2.4+ (Flexible Versioning)
**Key Change:** Introduction of "flexible" or "compact" message formats
- Compact types: COMPACT_STRING, COMPACT_ARRAY, etc.
- Tagged fields (KIP-482) for backwards-compatible extensions
- Header v2 with tagged fields support

**Currently Supported:** ✅ Encoder/decoder foundation complete

### Kafka 2.8+ (Topic IDs - KIP-516)
**Key Change:** Topic UUIDs replace topic names in many protocols
- Produce v13+, Fetch v13+, Metadata v10+
- More efficient wire format
- Better handling of topic renames

**Currently Supported:** ✅ UUID encoding/decoding ready

### Kafka 3.x+
- Enhanced consumer group protocols
- Improved transaction coordination
- Share groups preparation (KIP-932)

**Currently Supported:** 🟡 Partial - needs version upgrades

### Kafka 4.0+ (Next-Gen Rebalance - KIP-848)
**Key Change:** Server-driven consumer group protocol
- ConsumerGroupHeartbeat API (68)
- ConsumerGroupDescribe API (69)
- Server-side partition assignment
- Member epochs instead of generations

**Currently Supported:** ✅ ConsumerGroupHeartbeat v0 complete

## Using Compact Types in New Protocol Versions

### Encoder Example (Flexible Version)
```javascript
// src/protocol/requests/myapi/v9/request.js
module.exports = ({ param1, param2, taggedFields }) => ({
  apiKey: XX,
  apiVersion: 9,
  apiName: 'MyApi',
  encode: async ({ encoder }) => {
    // Compact string instead of regular string
    encoder.writeCompactString(param1)
    
    // Compact nullable string
    encoder.writeCompactNullableString(param2)
    
    // Compact array with custom item writer
    encoder.writeUVarIntArray(myArray, (encoder, item) => {
      encoder.writeCompactString(item.name)
      encoder.writeInt32(item.value)
      encoder.writeTaggedFields({}) // Empty tagged fields for item
    })
    
    // Tagged fields at the end (always required in flexible versions)
    encoder.writeTaggedFields(taggedFields || {})
  }
})
```

### Decoder Example (Flexible Version)
```javascript
// src/protocol/requests/myapi/v9/response.js
const decode = async rawData => {
  const decoder = new Decoder(rawData)
  
  // Compact string
  const param1 = decoder.readCompactString()
  
  // Compact nullable string
  const param2 = decoder.readCompactNullableString()
  
  // Compact array
  const myArray = decoder.readCompactArray(decoder => ({
    name: decoder.readCompactString(),
    value: decoder.readInt32(),
    _taggedFields: decoder.readTaggedFields() // Read item tagged fields
  }))
  
  // Tagged fields at the end
  const taggedFields = decoder.readTaggedFields()
  
  return {
    param1,
    param2,
    myArray,
    _taggedFields: taggedFields
  }
}

module.exports = { decode, parse: decode }
```

## Tagged Fields Usage (KIP-482)

Tagged fields allow adding new optional fields without breaking compatibility:

### Writing Tagged Fields
```javascript
// No tagged fields (most common case)
encoder.writeTaggedFields({})

// With tagged fields
encoder.writeTaggedFields({
  0: 'some string value',     // Tag 0: auto-encodes string
  1: 12345,                    // Tag 1: auto-encodes number
  2: Buffer.from('data'),      // Tag 2: raw buffer
  5: someEncoder               // Tag 5: another encoder instance
})
```

### Reading Tagged Fields
```javascript
// Always read tagged fields even if you don't use them
const taggedFields = decoder.readTaggedFields()
// Returns null if no tagged fields present
// Returns {} if present but we don't process them
```

## Topic ID Support (KIP-516)

### Writing Topic IDs
```javascript
// In older versions (v0-v12)
encoder.writeString(topicName)

// In newer versions (v13+)
encoder.writeUUID(topicId) // UUID string or 16-byte Buffer
```

### Reading Topic IDs
```javascript
// Older versions
const topicName = decoder.readString()

// Newer versions
const topicId = decoder.readUUID() // Returns UUID string or null
```

## Implementation Checklist for New Versions

When adding a new protocol version:

- [ ] Create version directory: `vN/request.js` and `vN/response.js`
- [ ] Update `index.js` to include new version in versions object
- [ ] Use compact types if version >= 9 (check protocol docs)
- [ ] Always include tagged fields in flexible versions
- [ ] Update request header version (v2 for flexible versions)
- [ ] Update response header version (v1 for flexible versions)
- [ ] Add unit tests for encoder/decoder
- [ ] Test backwards compatibility
- [ ] Update CHANGELOG.md
- [ ] Update this reference guide

## Testing New Implementations

```bash
# Run unit tests
npm test

# Run specific test file
npm test src/protocol/requests/myapi/index.spec.js

# Integration tests against different Kafka versions
# (requires Docker and test brokers)
npm run test:integration
```

## Resources

- [Kafka Protocol Guide](https://kafka.apache.org/protocol) - Official protocol documentation
- [KIP-482: Tagged Fields](https://cwiki.apache.org/confluence/x/OhMyBw)
- [KIP-516: Topic IDs](https://cwiki.apache.org/confluence/display/KAFKA/KIP-516)
- [KIP-848: Consumer Rebalance](https://cwiki.apache.org/confluence/x/OhMyBw)

## Contact & Contributing

For questions about protocol implementation:
1. Check KAFKA-PROTOCOL-UPGRADE-PLAN.md for detailed implementation guidelines
2. Check KAFKA-PROTOCOL-UPGRADE-STATUS.md for current progress
3. Review existing protocol implementations in `src/protocol/requests/`
4. Refer to [Contributing Guide](CONTRIBUTING.md)
