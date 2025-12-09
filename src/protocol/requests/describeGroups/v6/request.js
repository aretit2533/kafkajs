const requestV4 = require('../v4/request')

/**
 * DescribeGroups Request (Version: 6) => Same as v4
 */

module.exports = ({ groupIds, includeAuthorizedOperations }) =>
  Object.assign(requestV4({ groupIds, includeAuthorizedOperations }), { apiVersion: 6 })
