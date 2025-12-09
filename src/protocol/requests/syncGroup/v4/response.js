const Decoder = require('../../../decoder')
const { failIfVersionNotSupported } = require('../../../error')
const { parse: parseV0 } = require('../v0/response')

/**
 * SyncGroup Response (Version: 4) => throttle_time_ms error_code protocol_type protocol_name member_assignment TAG_BUFFER
 *   throttle_time_ms => INT32
 *   error_code => INT16
 *   protocol_type => COMPACT_NULLABLE_STRING
 *   protocol_name => COMPACT_NULLABLE_STRING
 *   member_assignment => COMPACT_BYTES
 */

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const errorCode = decoder.readInt16()

  failIfVersionNotSupported(errorCode)

  const protocolType = decoder.readCompactNullableString()
  const protocolName = decoder.readCompactNullableString()
  const memberAssignment = decoder.readCompactBytes()
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    errorCode,
    protocolType,
    protocolName,
    memberAssignment,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
