const Encoder = require('../../../encoder')
const { Metadata: apiKey } = require('../../apiKeys')

/**
 * Metadata Request (Version: 8) => [topics] allow_auto_topic_creation include_cluster_authorized_operations include_topic_authorized_operations TAG_BUFFER
 *   topics => topic_id TAG_BUFFER
 *     topic_id => UUID
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
  apiVersion: 8,
  apiName: 'Metadata',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics || [], (encoder, topic) => {
        return encoder.writeUUID(topic.topicId || topic).writeTaggedFields({})
      })
      .writeBoolean(allowAutoTopicCreation)
      .writeBoolean(includeClusterAuthorizedOperations)
      .writeBoolean(includeTopicAuthorizedOperations)
      .writeTaggedFields({})
  },
})
