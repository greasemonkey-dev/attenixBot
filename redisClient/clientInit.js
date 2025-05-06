const redis = require("redis-promisify");
// ! TTL is not working

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "redis", // Use the appropriate host, could be 'redis' if using Docker Compose service name
  port: process.env.REDIS_PORT || 6379, // Default Redis port
});

console.log(`Connecting to Redis at ${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || 6379}...`);

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});
const {  setAsync, delAsync } = redisClient;

const createOrUpdate = (key, value) => {
  console.log('Setting value:', value);
  redisClient.set(key, value, (err, reply) => {
    if (err) {
      console.error('Error setting value:', err);
    } else {
      console.log('Set result:', reply);
    }
  });
};
const getAsync = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
}
module.exports = { redisClient, getAsync, setAsync, delAsync ,createOrUpdate};


