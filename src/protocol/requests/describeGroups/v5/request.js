const requestV4 = require('../v4/request')

/**
 * DescribeGroups Request (Version: 5) => Same as v4
 */

module.exports = ({ groupIds, includeAuthorizedOperations }) =>
  Object.assign(requestV4({ groupIds, includeAuthorizedOperations }), { apiVersion: 5 })
