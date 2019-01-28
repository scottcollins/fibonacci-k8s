const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// create a subscriber listener
const sub = redisClient.duplicate();

function fib(level) {
  if (level < 0)
  {
      return 0;
  }

  if (level < 2) {
    return 1;
  }

  return fib(level - 1) + fib(level - 2);
}

sub.on("message", (channel, message) => {
  console.log("Message received. Message: " + message);  

  try {
    var value = fib(parseInt(message));

    if (value) {
      // Sets a hashmap entry in redis.  
            // values is the key of the dictionary (hashmap)
            // message is the key within the hashmap
            // last value is the value assigned to the key in the hashmap
      redisClient.hset('values', message, value);

      console.log("     Set value of message to " + value);  
    } else {
      console.log("     Could not process message with value of '" + message + "'");
    }
  } catch {
    console.log("     Could not process message with value of '" + message + "'");
  }
});

// Subscribe to insert events
sub.subscribe('insert');

console.log('started...')