const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');         // required to parse the body of the REST call to a JSON object
const cors = require('cors');

const app = express();
app.use(cors());

app.use(bodyParser.json());            // uses this parser's json function to parse the json coming in the body of a request

// PostGres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

console.log("postgres connection: " + pgClient.Pool); 

// Default error handling for the database connection
pgClient.on("error", (err, client) => {      
  console.log('Lost PostGres connection. Error: ' + err);
});

function createTable(loop) {
  if (loop < 5) {
    // Create table if it does not yet exist
    pgClient
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .then(value => console.log("Table created"))
        .catch(err => {
          console.log("Could not create table on loop " + loop + ": " + err);

          console.log("sleeping...");

          setTimeout(() => {
            console.log("awake");

            createTable(loop + 1);
          }, 1000);
        });
  } else {
    console.log("retries have expired ==========================");
  }
}

createTable(0);

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();


// Express route handlers
app.get('/', (req, res) => {
  res.send('Hello, I am working');
});

// This example uses promises and async/await syntax
// PostGres client library has promise support
app.get('/values/all', async (req, res) => {
  console.log("Got a request for /values/all");  

  const valuesFromDb = await pgClient.query('select * from values');

  console.log("     returning: " + valuesFromDb.rows);

  res.send(valuesFromDb.rows);
});

// This example uses callbacks.  The Callback function type has 2 parameters (err, value)
// Redis client does not have promise support
app.get('/values/current', async (req, res) => {
  console.log("Got a request for /values/current");  

  redisClient.hgetall('values', (err, values) => {
    console.log("     returning: " + values);

    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  console.log("Got a request POSTing to /values");  
  
  const index = req.body.index;

  console.log("   POSTed index was " + index);  

  if (parseInt(index) > 40) {
      return res.status(422).send('Index too high');
  }

  // store the value in redis
  redisClient.hset('values', index, 'Nothing yet');

  // publish a message over redis to the worker
  redisPublisher.publish('insert', index);

  pgClient.query('insert into values (number) values ($1)', [index]);

  res.send({ working: true });
});

// start the listner on port 5000
app.listen(5000, err => {
    console.log("listening on port 5000");
});
