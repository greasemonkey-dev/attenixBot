const redis = require("redis-promisify");
// ! TTL is not working

const redisClient = redis.createClient({
  host: "127.0.0.1", // Use the appropriate host, could be 'redis' if using Docker Compose service name
  port: 6379, // Default Redis port
});
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


