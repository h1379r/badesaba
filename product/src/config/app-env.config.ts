export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'develompent',
  port: parseInt(process.env.PORT) || 3000,
  pathPrefix: process.env.PATH_PREFIX,

  // kafka
  kafka: {
    broker: process.env.KAFKA_BROKER,
    clientId: process.env.KAFKA_CLIENT_ID,
  },

  // mongodb
  mongo: {
    uri: process.env.MONGO_URI,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  },

  // redis
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },

  // access token
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
  },

  // inter service communication
  isc: {
    secret: process.env.ISC_SECRET,
  },

  // transaction
  transaction: {
    baseUrl: process.env.TRANSACTION_BASE_URL,
  },
});
