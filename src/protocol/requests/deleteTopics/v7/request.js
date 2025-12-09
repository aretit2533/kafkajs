const requestV6 = require('../v6/request')

/**
 * DeleteTopics Request (Version: 7) => Same as v6
 */

module.exports = ({ topics, timeout }) =>
  Object.assign(requestV6({ topics, timeout }), { apiVersion: 7 })
