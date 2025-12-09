const Encoder = require('../../../encoder')
const { Metadata: apiKey } = require('../../apiKeys')

/**
 * Metadata Request (Version: 7) => [topics] allow_auto_topic_creation TAG_BUFFER
 *   topics => topic_id TAG_BUFFER
 *     topic_id => UUID
 *   allow_auto_topic_creation => BOOLEAN
 */

module.exports = ({ topics, allowAutoTopicCreation = true }) => ({
  apiKey,
  apiVersion: 7,
  apiName: 'Metadata',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics || [], (encoder, topic) => {
        return encoder.writeUUID(topic.topicId || topic).writeTaggedFields({})
      })
      .writeBoolean(allowAutoTopicCreation)
      .writeTaggedFields({})
  },
})
