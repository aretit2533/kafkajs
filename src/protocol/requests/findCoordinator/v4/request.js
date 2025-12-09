const Encoder = require('../../../encoder')
const { FindCoordinator: apiKey } = require('../../apiKeys')
const COORDINATOR_TYPES = require('../../coordinatorTypes')

/**
 * FindCoordinator Request (Version: 4) => [coordinator_keys] coordinator_type TAG_BUFFER
 *   coordinator_keys => COMPACT_STRING
 *   coordinator_type => INT8
 */

module.exports = ({ coordinatorKeys, coordinatorType = COORDINATOR_TYPES.GROUP }) => ({
  apiKey,
  apiVersion: 4,
  apiName: 'FindCoordinator',
  encode: async () => {
    const keys = Array.isArray(coordinatorKeys) ? coordinatorKeys : [coordinatorKeys]
    return new Encoder()
      .writeUVarIntArray(keys, (encoder, key) => encoder.writeCompactString(key))
      .writeInt8(coordinatorType)
      .writeTaggedFields({})
  },
})
