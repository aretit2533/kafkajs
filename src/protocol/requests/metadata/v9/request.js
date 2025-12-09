const Encoder = require('../../../encoder')
const { Metadata: apiKey } = require('../../apiKeys')

/**
 * Metadata Request (Version: 9) => [topics] allow_auto_topic_creation include_cluster_authorized_operations include_topic_authorized_operations TAG_BUFFER
 *   topics => name TAG_BUFFER
 *     name => COMPACT_STRING
 *   allow_auto_topic_creation => BOOLEAN
 *   include_cluster_authorized_operations => BOOLEAN
 *   include_topic_authorized_operations => BOOLEAN
 */

module.exports = ({
  topics,
  allowAutoTopicCreation = true,
  includeClusterAuthorizedOperations = false,
  includeTopicAuthorizedOperations = false,
}) => ({
  apiKey,
  apiVersion: 9,
  apiName: 'Metadata',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics || [], (encoder, topic) => {
        const topicName = typeof topic === 'string' ? topic : topic.name
        return encoder.writeCompactString(topicName).writeTaggedFields({})
      })
      .writeBoolean(allowAutoTopicCreation)
      .writeBoolean(includeClusterAuthorizedOperations)
      .writeBoolean(includeTopicAuthorizedOperations)
      .writeTaggedFields({})
  },
})
