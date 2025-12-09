const Encoder = require('../../../encoder')
const { DescribeConfigs: apiKey } = require('../../apiKeys')

/**
 * DescribeConfigs Request (Version: 4) => [resources] include_synonyms include_documentation TAG_BUFFER
 *   resources => resource_type resource_name [config_names] TAG_BUFFER
 *     resource_type => INT8
 *     resource_name => COMPACT_STRING
 *     config_names => COMPACT_STRING
 *   include_synonyms => BOOLEAN
 *   include_documentation => BOOLEAN
 */

module.exports = ({ resources, includeSynonyms = false, includeDocumentation = false }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'DescribeConfigs',
  encode: async () => {
    return new Encoder()
      .writeUVarIntArray(resources, encodeResource)
      .writeBoolean(includeSynonyms)
      .writeBoolean(includeDocumentation)
      .writeTaggedFields({})
  },
})

const encodeResource = ({ type, name, configNames = [] }) => {
  return new Encoder()
    .writeInt8(type)
    .writeCompactString(name)
    .writeUVarInt(configNames.length === 0 ? 0 : configNames.length + 1)
    .write(
      configNames.length === 0
        ? Buffer.alloc(0)
        : Buffer.concat(configNames.map(cn => new Encoder().writeCompactString(cn).buffer))
    )
    .writeTaggedFields({})
}
