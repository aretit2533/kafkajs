const Encoder = require('../../../encoder')
const { CreateTopics: apiKey } = require('../../apiKeys')

/**
 * CreateTopics Request (Version: 6) => [topics] timeout_ms validate_only TAG_BUFFER
 *   topics => name num_partitions replication_factor [assignments] [configs] TAG_BUFFER
 *     name => COMPACT_STRING
 *     num_partitions => INT32
 *     replication_factor => INT16
 *     assignments => partition [broker_ids] TAG_BUFFER
 *       partition => INT32
 *       broker_ids => INT32
 *     configs => name value TAG_BUFFER
 *       name => COMPACT_STRING
 *       value => COMPACT_NULLABLE_STRING
 *   timeout_ms => INT32
 *   validate_only => BOOLEAN
 */

module.exports = ({ topics, validateOnly = false, timeout = 5000 }) => ({
  apiKey,
  apiVersion: 6,
  apiName: 'CreateTopics',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics, (encoder, topic) => encoder.writeEncoder(encodeTopics(topic)))
      .writeInt32(timeout)
      .writeBoolean(validateOnly)
      .writeTaggedFields({})
  },
})

const encodeTopics = ({
  topic,
  numPartitions = -1,
  replicationFactor = -1,
  replicaAssignment = [],
  configEntries = [],
}) => {
  return new Encoder()
    .writeCompactString(topic)
    .writeInt32(numPartitions)
    .writeInt16(replicationFactor)
    .writeUVarIntArray(replicaAssignment, (encoder, assignment) =>
      encoder.writeEncoder(encodeReplicaAssignment(assignment))
    )
    .writeUVarIntArray(configEntries, (encoder, config) =>
      encoder.writeEncoder(encodeConfigEntries(config))
    )
    .writeTaggedFields({})
}

const encodeReplicaAssignment = ({ partition, replicas }) => {
  return new Encoder()
    .writeInt32(partition)
    .writeArray(replicas)
    .writeTaggedFields({})
}

const encodeConfigEntries = ({ name, value }) => {
  return new Encoder()
    .writeCompactString(name)
    .writeCompactNullableString(value)
    .writeTaggedFields({})
}
