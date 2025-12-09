const Decoder = require('../../../decoder')
const { failIfVersionNotSupported } = require('../../../error')
const { parse: parseV0 } = require('../v0/response')

/**
 * ApiVersions Response (Version: 3) => error_code [api_versions] throttle_time_ms TAG_BUFFER
 *   error_code => INT16
 *   api_versions => api_key min_version max_version TAG_BUFFER
 *     api_key => INT16
 *     min_version => INT16
 *     max_version => INT16
 *   throttle_time_ms => INT32
 */

const apiVersion = decoder => ({
  apiKey: decoder.readInt16(),
  minVersion: decoder.readInt16(),
  maxVersion: decoder.readInt16(),
  taggedFields: decoder.readTaggedFields(),
})

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const errorCode = decoder.readInt16()

  failIfVersionNotSupported(errorCode)

  const apiVersions = decoder.readCompactArray(apiVersion)
  const throttleTime = decoder.canReadInt32() ? decoder.readInt32() : 0
  decoder.readTaggedFields()

  return {
    errorCode,
    apiVersions,
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
