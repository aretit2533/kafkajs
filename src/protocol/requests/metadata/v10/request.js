const Encoder = require('../../../encoder')
const { Metadata: apiKey } = require('../../apiKeys')

/**
 * Metadata Request (Version: 10) => [topics] allow_auto_topic_creation include_topic_authorized_operations TAG_BUFFER
 *   topics => topic_id name TAG_BUFFER
 *     topic_id => UUID
 *     name => COMPACT_NULLABLE_STRING
 *   allow_auto_topic_creation => BOOLEAN
 *   include_topic_authorized_operations => BOOLEAN
 */

module.exports = ({
  topics,
  allowAutoTopicCreation = true,
  includeTopicAuthorizedOperations = false,
}) => ({
  apiKey,
  apiVersion: 10,
  apiName: 'Metadata',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics || [], (encoder, topic) => {
        const topicId = topic.topicId || null
        const topicName = typeof topic === 'string' ? topic : topic.name
        return encoder
          .writeUUID(topicId)
          .writeCompactNullableString(topicName)
          .writeTaggedFields({})
      })
      .writeBoolean(allowAutoTopicCreation)
      .writeBoolean(includeTopicAuthorizedOperations)
      .writeTaggedFields({})
  },
})
