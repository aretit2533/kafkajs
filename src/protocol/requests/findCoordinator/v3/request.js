const Encoder = require('../../../encoder')
const { FindCoordinator: apiKey } = require('../../apiKeys')
const COORDINATOR_TYPES = require('../../coordinatorTypes')

/**
 * FindCoordinator Request (Version: 3) => coordinator_key coordinator_type TAG_BUFFER
 *   coordinator_key => COMPACT_STRING
 *   coordinator_type => INT8
 */

module.exports = ({ coordinatorKey, coordinatorType = COORDINATOR_TYPES.GROUP }) => ({
  apiKey,
  apiVersion: 3,
  apiName: 'FindCoordinator',
  encode: async () => {
    return new Encoder()
      .writeCompactString(coordinatorKey)
      .writeInt8(coordinatorType)
      .writeTaggedFields({})
  },
})
