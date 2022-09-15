// Example AWS Lambda function handler. Delete before adding a new handler.
exports.sayHello = async () => {
  const message = 'Hello, world!'
  console.info(`${message}`) // writes to CloudWatch
  return message
}
