const Long = require('../../../../utils/long')
const Encoder = require('../../../encoder')
const { Produce: apiKey } = require('../../apiKeys')
const { Types } = require('../../../message/compression')
const Record = require('../../../recordBatch/record/v0')
const { RecordBatch } = require('../../../recordBatch/v0')

/**
 * V9 adds flexible versioning (compact types and tagged fields)
 *
 * Produce Request (Version: 9) => transactional_id acks timeout [topic_data] TAG_BUFFER
 *   transactional_id => COMPACT_NULLABLE_STRING
 *   acks => INT16
 *   timeout => INT32
 *   topic_data => name [partition_data] TAG_BUFFER
 *     name => COMPACT_STRING
 *     partition_data => index records TAG_BUFFER
 *       index => INT32
 *       records => COMPACT_RECORDS
 */

module.exports = ({
  acks,
  timeout,
  transactionalId = null,
  producerId = Long.fromInt(-1),
  producerEpoch = 0,
  compression = Types.None,
  topicData,
}) => ({
  apiKey,
  apiVersion: 9,
  apiName: 'Produce',
  expectResponse: () => acks !== 0,
  encode: async () => {
    const encodeTopic = topicEncoder(compression)
    const encodedTopicData = []

    for (const data of topicData) {
      encodedTopicData.push(
        await encodeTopic({ ...data, transactionalId, producerId, producerEpoch })
      )
    }

    return new Encoder()
      .writeCompactNullableString(transactionalId)
      .writeInt16(acks)
      .writeInt32(timeout)
      .writeUVarIntArray(encodedTopicData, (encoder, topic) => encoder.writeEncoder(topic))
      .writeTaggedFields({})
  },
})

const topicEncoder = compression => async ({
  topic,
  partitions,
  transactionalId,
  producerId,
  producerEpoch,
}) => {
  const encodePartitions = partitionsEncoder(compression)
  const encodedPartitions = []

  for (const data of partitions) {
    encodedPartitions.push(
      await encodePartitions({ ...data, transactionalId, producerId, producerEpoch })
    )
  }

  return new Encoder()
    .writeCompactString(topic)
    .writeUVarIntArray(encodedPartitions, (encoder, partition) => encoder.writeEncoder(partition))
    .writeTaggedFields({})
}

const partitionsEncoder = compression => async ({
  partition,
  messages,
  transactionalId,
  firstSequence,
  producerId,
  producerEpoch,
}) => {
  const dateNow = Date.now()
  const messageTimestamps = messages
    .map(m => m.timestamp)
    .filter(timestamp => timestamp != null)
    .sort()

  const timestamps = messageTimestamps.length === 0 ? [dateNow] : messageTimestamps
  const firstTimestamp = timestamps[0]
  const maxTimestamp = timestamps[timestamps.length - 1]

  const records = messages.map((message, i) =>
    Record({
      ...message,
      offsetDelta: i,
      timestampDelta: (message.timestamp || dateNow) - firstTimestamp,
    })
  )

  const recordBatch = await RecordBatch({
    compression,
    records,
    firstTimestamp,
    maxTimestamp,
    firstSequence,
    producerId,
    producerEpoch,
    transactional: transactionalId != null,
  })

  return new Encoder()
    .writeInt32(partition)
    .writeCompactBytes(recordBatch)
    .writeTaggedFields({})
}
