const Encoder = require('../../../encoder')
const { DeleteTopics: apiKey } = require('../../apiKeys')

/**
 * DeleteTopics Request (Version: 6) => [topics] timeout_ms TAG_BUFFER
 *   topics => name topic_id TAG_BUFFER
 *     name => COMPACT_NULLABLE_STRING
 *     topic_id => UUID
 *   timeout_ms => INT32
 */

module.exports = ({ topics, timeout = 5000 }) => ({
  apiKey,
  apiVersion: 6,
  apiName: 'DeleteTopics',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics, (encoder, topic) => {
        const topicName = typeof topic === 'string' ? topic : topic.name
        const topicId = typeof topic === 'object' ? topic.topicId : null
        return encoder
          .writeCompactNullableString(topicName)
          .writeUUID(topicId)
          .writeTaggedFields({})
      })
      .writeInt32(timeout)
      .writeTaggedFields({})
  },
})
