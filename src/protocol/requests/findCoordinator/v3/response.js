const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * FindCoordinator Response (Version: 3) => throttle_time_ms error_code error_message [coordinators] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   error_message => COMPACT_NULLABLE_STRING
 *   coordinators => key node_id host port TAG_BUFFER
 *     key => COMPACT_STRING
 *     node_id => INT32
 *     host => COMPACT_STRING
 *     port => INT32
 */

const decodeCoordinator = decoder => ({
  key: decoder.readCompactString(),
  nodeId: decoder.readInt32(),
  host: decoder.readCompactString(),
  port: decoder.readInt32(),
  _taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()
  const errorMessage = decoder.readCompactNullableString()
  const coordinators = decoder.readCompactArray(decodeCoordinator)
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errorCode,
    errorMessage,
    coordinator: coordinators[0] || { nodeId: -1, host: '', port: -1 },
    coordinators,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
