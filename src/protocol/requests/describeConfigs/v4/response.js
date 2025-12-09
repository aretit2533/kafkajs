const Decoder = require('../../../decoder')
const { parse: parseV0 } = require('../v0/response')
const { DEFAULT_CONFIG } = require('../../../configSource')

/**
 * DescribeConfigs Response (Version: 4) => throttle_time_ms [results] TAG_BUFFER
 *   throttle_time_ms => INT32
 *   results => error_code error_message resource_type resource_name [configs] TAG_BUFFER
 *     error_code => INT16
 *     error_message => COMPACT_NULLABLE_STRING
 *     resource_type => INT8
 *     resource_name => COMPACT_STRING
 *     configs => name value read_only config_source is_sensitive [synonyms] config_type documentation TAG_BUFFER
 *       name => COMPACT_STRING
 *       value => COMPACT_NULLABLE_STRING
 *       read_only => BOOLEAN
 *       config_source => INT8
 *       is_sensitive => BOOLEAN
 *       synonyms => name value source TAG_BUFFER
 *         name => COMPACT_STRING
 *         value => COMPACT_NULLABLE_STRING
 *         source => INT8
 *       config_type => INT8
 *       documentation => COMPACT_NULLABLE_STRING
 */

const decodeSynonyms = decoder => {
  const configName = decoder.readCompactString()
  const configValue = decoder.readCompactNullableString()
  const configSource = decoder.readInt8()
  decoder.readTaggedFields()

  return {
    configName,
    configValue,
    configSource,
  }
}

const decodeConfigEntries = decoder => {
  const configName = decoder.readCompactString()
  const configValue = decoder.readCompactNullableString()
  const readOnly = decoder.readBoolean()
  const configSource = decoder.readInt8()
  const isSensitive = decoder.readBoolean()
  const configSynonyms = decoder.readCompactArray(decodeSynonyms)
  const configType = decoder.readInt8()
  const documentation = decoder.readCompactNullableString()
  decoder.readTaggedFields()

  return {
    configName,
    configValue,
    readOnly,
    isDefault: configSource === DEFAULT_CONFIG,
    configSource,
    isSensitive,
    configSynonyms,
    configType,
    documentation,
  }
}

const decodeResources = decoder => {
  const errorCode = decoder.readInt16()
  const errorMessage = decoder.readCompactNullableString()
  const resourceType = decoder.readInt8()
  const resourceName = decoder.readCompactString()
  const configEntries = decoder.readCompactArray(decodeConfigEntries)
  decoder.readTaggedFields()

  return {
    errorCode,
    errorMessage,
    resourceType,
    resourceName,
    configEntries,
  }
}

const decode = async rawData => {
  const decoder = new Decoder(rawData)
  const throttleTime = decoder.readInt32()
  const resources = decoder.readCompactArray(decodeResources)
  decoder.readTaggedFields()

  return {
    throttleTime: 0,
    clientSideThrottleTime: throttleTime,
    resources,
  }
}

module.exports = {
  decode,
  parse: parseV0,
}
