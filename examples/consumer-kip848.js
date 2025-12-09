const { Kafka } = require('../index')

/**
 * Example demonstrating the new KIP-848 consumer group protocol
 *
 * Requirements:
 * - Apache Kafka 4.0+ or Confluent Platform 8.0+
 * - Topic 'kip-848-test' must exist
 *
 * Run with: node examples/consumer-kip848.js
 */

const run = async () => {
  const kafka = new Kafka({
    clientId: 'kip-848-example',
    brokers: ['localhost:9092'],
  })

  // Create a consumer using the new KIP-848 protocol
  const consumer = kafka.consumer({
    groupId: 'kip-848-consumer-group',
    groupProtocol: 'consumer', // Enable KIP-848 protocol
    groupRemoteAssignor: 'uniform', // Server-side assignor (optional, defaults to 'uniform')

    // Note: sessionTimeout and heartbeatInterval are now configured server-side
    // The rebalanceTimeout is still used to indicate how long the consumer needs to revoke partitions
    rebalanceTimeout: 60000,
  })

  // Connect the consumer
  await consumer.connect()
  console.log('Consumer connected using KIP-848 protocol')

  // Subscribe to topics
  await consumer.subscribe({
    topics: ['kip-848-test'],
    fromBeginning: true,
  })
  console.log('Subscribed to topic: kip-848-test')

  // Run the consumer
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value.toString(),
        timestamp: message.timestamp,
      })
    },
  })
}

run().catch(console.error)

// Graceful shutdown
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.forEach(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.forEach(type => {
  process.once(type, async () => {
    try {
      console.log(`process.once ${type}`)
    } finally {
      process.kill(process.pid, type)
    }
  })
})
