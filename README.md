[![npm version](https://img.shields.io/npm/v/@aretit2533/kafkajs?color=%2344cc11&label=stable)](https://www.npmjs.com/package/@aretit2533/kafkajs)
<br />
<p align="center">
  <a href="https://kafka.js.org">
      <img src="https://raw.githubusercontent.com/tulios/kafkajs/master/logo/v2/kafkajs_circle.svg" alt="Logo" width="125" height="125">
  </a>

  <h3 align="center">KafkaJS - Extended Protocol Support</h3>

  <p align="center">
    A modern Apache Kafka® client for Node.js with extended protocol version support
    <br />
    <em>Forked from <a href="https://github.com/tulios/kafkajs">tulios/kafkajs</a> with latest Kafka protocol upgrades</em>
    <br />
    <a href="https://kafka.js.org/"><strong>Get Started »</strong></a>
    <br />
    <br />
    <a href="https://kafka.js.org/docs/getting-started" target="_blank">Read the Docs</a>
    ·
    <a href="https://github.com/tulios/kafkajs/issues/new?assignees=&labels=&template=bug_report.md&title=">Report Bug</a>
    ·
    <a href="https://github.com/tulios/kafkajs/issues/new?assignees=&labels=&template=feature_request.md&title=">Request Feature</a>
  </p>
</p>

> **Note**: This is an extended fork of the original [KafkaJS](https://github.com/tulios/kafkajs) project by [@tulios](https://github.com/tulios), enhanced with support for the latest Kafka protocol versions and flexible/compact encoding (KIP-482, KIP-516, and related KIPs). All credit for the original implementation goes to the KafkaJS team and contributors.

## Table of Contents

- [About the project](#about)
  - [What's New in This Fork](#whats-new)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Usage](#usage)
- [Contributing](#contributing)
  - [Help Wanted](#help-wanted)
  - [Contact](#contact)
- [License](#license)
  - [Acknowledgements](#acknowledgements)

## <a name="about"></a> About the Project

KafkaJS is a modern [Apache Kafka](https://kafka.apache.org/) client for Node.js. It is compatible with Kafka 0.10+ and offers native support for 0.11 features.

This fork extends the original KafkaJS implementation with comprehensive support for the latest Kafka protocol versions, ensuring compatibility with modern Kafka brokers and enabling access to advanced features introduced in recent Kafka releases.

<small>KAFKA is a registered trademark of The Apache Software Foundation and has been licensed for use by KafkaJS. KafkaJS has no affiliation with and is not endorsed by The Apache Software Foundation.</small>

### <a name="whats-new"></a> What's New in This Fork

This fork implements **144 new protocol version files** across all major Kafka APIs, bringing full support for the latest protocol specifications:

#### **Enhanced Protocol Support**
- **Flexible/Compact Encoding (KIP-482)**: All APIs now support flexible versioning with compact types (`COMPACT_STRING`, `COMPACT_ARRAY`, `COMPACT_BYTES`) and tagged fields for future extensibility
- **Topic IDs (KIP-516)**: UUID-based topic identifiers supported in Produce, Fetch, Metadata, and admin APIs
- **Static Consumer Group Membership**: Group instance IDs for stable consumer identities across restarts

#### **Upgraded APIs by Phase**

**Phase 1 - Critical APIs (60 files)**:
- **Produce v8-v13**: Flexible versioning, record-level errors, topic ID support
- **Fetch v12-v18**: Flexible versioning, topic IDs, enhanced partition handling
- **Metadata v7-v13**: Leader epoch, authorized operations, topic IDs, top-level error codes
- **ListOffsets v6-v9**: Flexible versioning with compact types
- **OffsetCommit v8-v9**: Flexible versioning and enhanced error handling
- **OffsetFetch v8-v9**: Flexible versioning with improved response structure

**Phase 2 - Consumer/Group Protocol (28 files)**:
- **JoinGroup v6-v10**: Flexible versioning, reason field for debugging
- **Heartbeat v4**: Flexible versioning support
- **DescribeGroups v4-v6**: Group instance ID, state descriptions, error messages
- **ListGroups v4-v5**: State and type filtering capabilities
- **FindCoordinator v3-v5**: Batched coordinator requests

**Phase 3 - Admin & Management (20 files)**:
- **CreateTopics v6-v8**: Topic ID support in responses
- **DeleteTopics v5-v7**: Topic ID deletion, enhanced error messages
- **ApiVersions v3-v4**: Client software name/version metadata
- **SyncGroup v4-v5**: Protocol type/name in responses
- **LeaveGroup v4-v5**: Batch member removal, reason field

**Phase 4 - Transaction APIs (16 files)**:
- **InitProducerId v4-v6**: Two-phase commit support, producer ID/epoch in request
- **AddPartitionsToTxn v4-v5**: Flexible versioning for transactional operations
- **AddOffsetsToTxn v4**: Compact encoding for consumer group integration
- **EndTxn v4**: Flexible versioning for transaction completion
- **TxnOffsetCommit v4**: Enhanced with generation ID, member ID, group instance ID

**Phase 5 - Additional Admin APIs (8 files)**:
- **DeleteRecords v2**: Flexible versioning for record deletion
- **CreatePartitions v3**: Compact encoding for partition expansion
- **DeleteGroups v2**: Flexible versioning for group deletion
- **DescribeConfigs v4**: Config documentation, type information

#### **Technical Enhancements**
- Full implementation of variable-length integer (varint) encoding for compact arrays
- Tagged fields support for backward-compatible protocol evolution
- UUID encoding/decoding for 16-byte topic identifiers
- Enhanced throttle handling with client-side throttle time separation
- Comprehensive error handling with detailed error messages

### <a name="features"></a> Features

* Producer
* Consumer groups with pause, resume, and seek
* **KIP-848 consumer group protocol** (next generation rebalance protocol)
* Transactional support for producers and consumers
* Message headers
* GZIP compression
  * Snappy, LZ4 and ZSTD compression through pluggable codecs
* Plain, SSL and SASL_SSL implementations
* Support for SCRAM-SHA-256 and SCRAM-SHA-512
* Support for AWS IAM authentication
* Admin client

### <a name="getting-started"></a> Getting Started

```sh
npm install @aretit2533/kafkajs
# yarn add @aretit2533/kafkajs
```

#### <a name="usage"></a> Usage
```javascript
const { Kafka } = require('@aretit2533/kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello KafkaJS user!' },
    ],
  })

  // Consuming
  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      })
    },
  })
}

run().catch(console.error)
```

Learn more about using [KafkaJS on the official site!](https://kafka.js.org)

- [Getting Started](https://kafka.js.org/docs/getting-started)
- [A Brief Intro to Kafka](https://kafka.js.org/docs/introduction)
- [Configuring KafkaJS](https://kafka.js.org/docs/configuration)
- [Example Producer](https://kafka.js.org/docs/producer-example)
- [Example Consumer](https://kafka.js.org/docs/consumer-example)

> _Read something on the website that didn't work with the latest stable version?_  
[Check the pre-release versions](https://kafka.js.org/docs/pre-releases) - the website is updated on every merge to master.

## <a name="contributing"></a> Contributing

KafkaJS is an open-source project where development takes place in the open on GitHub. Although the project is maintained by a small group of dedicated volunteers, we are grateful to the community for bug fixes, feature development and other contributions.

See [Developing KafkaJS](https://kafka.js.org/docs/contribution-guide) for information on how to run and develop KafkaJS.

### <a name="help-wanted"></a> Help wanted 🤝

We welcome contributions to KafkaJS, but we also want to see a thriving third-party ecosystem. If you would like to create an open-source project that builds on top of KafkaJS, [please get in touch](https://join.slack.com/t/kafkajs/shared_invite/zt-1ezd5395v-SOpTqYoYfRCyPKOkUggK0A) and we'd be happy to provide feedback and support.

Here are some projects that we would like to build, but haven't yet been able to prioritize:

* [Dead Letter Queue](https://eng.uber.com/reliable-reprocessing/) - Automatically reprocess messages
* ✅ [Schema Registry](https://www.confluent.io/confluent-schema-registry/) - **[Now available!](https://www.npmjs.com/package/@kafkajs/confluent-schema-registry)** thanks to [@erikengervall](https://github.com/erikengervall)
* [Metrics](https://prometheus.io/) - Integrate with the [instrumentation events](https://kafka.js.org/docs/instrumentation-events) to expose commonly used metrics

### <a name="contact"></a> Contact 💬

[Join our Slack community](https://join.slack.com/t/kafkajs/shared_invite/zt-1ezd5395v-SOpTqYoYfRCyPKOkUggK0A)

## <a name="license"></a> License

See [LICENSE](https://github.com/tulios/kafkajs/blob/master/LICENSE) for more details.

### <a name="acknowledgements"></a> Acknowledgements

* **Huge thanks to [@tulios](https://github.com/tulios) and all [KafkaJS contributors](https://github.com/tulios/kafkajs/graphs/contributors)** for creating and maintaining the excellent original KafkaJS project that this fork builds upon ❤️
* Thanks to [Sebastian Norde](https://github.com/sebastiannorde) for the V1 logo ❤️
* Thanks to [Tracy (Tan Yun)](https://medium.com/@tanyuntracy) for the V2 logo ❤️
* Thanks to the Apache Kafka community for the comprehensive [protocol documentation](https://kafka.apache.org/protocol)

<small>Apache Kafka and Kafka are either registered trademarks or trademarks of The Apache Software Foundation in the United States and other countries. KafkaJS has no affiliation with the Apache Software Foundation.</small>
