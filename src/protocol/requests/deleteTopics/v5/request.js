const Encoder = require('../../../encoder')
const { DeleteTopics: apiKey } = require('../../apiKeys')

/**
 * DeleteTopics Request (Version: 5) => [topic_names] timeout_ms TAG_BUFFER
 *   topic_names => COMPACT_STRING
 *   timeout_ms => INT32
 */

module.exports = ({ topics, timeout = 5000 }) => ({
  apiKey,
  apiVersion: 5,
  apiName: 'DeleteTopics',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(topics, (encoder, topic) => encoder.writeCompactString(topic))
      .writeInt32(timeout)
      .writeTaggedFields({})
  },
})
