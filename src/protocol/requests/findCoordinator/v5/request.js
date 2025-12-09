const requestV4 = require('../v4/request')

/**
 * FindCoordinator Request (Version: 5) => Same as v4
 */

module.exports = ({ coordinatorKeys, coordinatorType }) =>
  Object.assign(requestV4({ coordinatorKeys, coordinatorType }), { apiVersion: 5 })
