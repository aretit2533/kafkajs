const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')

/**
 * Heartbeat Response (Version: 4) => throttle_time_ms error_code TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 */

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()
  const taggedFields = decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errorCode,
    _taggedFields: taggedFields,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
