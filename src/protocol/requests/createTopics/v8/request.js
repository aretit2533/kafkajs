const requestV6 = require('../v6/request')

/**
 * CreateTopics Request (Version: 8) => Same as v6
 */

module.exports = ({ topics, validateOnly, timeout }) =>
  Object.assign(requestV6({ topics, validateOnly, timeout }), { apiVersion: 8 })
