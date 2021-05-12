const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { PSQLinitialization, pool, client } = require('./postgresql_init');

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'FSS-devaajat',
      description: 'A demo for developers about containerization.',
      version: '1.0.0',
    },
  },
  apis: ["server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json());

PSQLinitialization();

/* GET home page. */
/**
 * @swagger
 * /:
 *   get:
 *     description: Get home page
 *     responses:
 *       200:
 *         description: Success
 * 
 */
app.get('/', function(req, res, next) {
  pool.query('SELECT * FROM users', (err, res) => {
    console.log(err, res)
    pool.end()
  });

  client.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
  });
  res.send('This is the homepage. Welcome!');
});

/* GET users listing. */
/**
 * @swagger
 * /users/getAllUsers:
 *   get:
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Success
 * 
 */
app.get('/users/getAllUsers', function(req, response, next) {
  client.query('SELECT * FROM users', (err, res) => {
    response.send(res.rows);
    console.log(err, res);
  });
});

// Create a user
/**
 * @swagger
 * /users:
 *   post:
 *     description: Create a user via get (for demo)
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The user to create.
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - title
 *          properties:
 *            name:
 *              type: string
 *            title:
 *              type: string
 *     responses:
 *       200:
 *         description: Success
 * 
 */
app.post('/users', function(req, response, next) {
  if (req.body.title && req.body.name) {
    const userObject = {
      name: req.body.name,
      title: req.body.title
    };
    console.log(userObject);
    const values = [req.body.name, req.body.title];
    const text = `INSERT INTO users(name, title) VALUES($1, $2) RETURNING *`;
    const queryObject = {
      text: text,
      values: values
    };
    client
      .query(queryObject)
      .then(res => {
        response.send(userObject);
        console.log(res.rows[0])
      })
      .catch(e => console.error(e.stack))
  } else {
    response.send('An error occurred, try again later.');
  }
});

app.get('/users', function(req, response, next) {
  client.query('SELECT * FROM users', (err, res) => {
    response.send(res.rows);
    console.log(err, res);
  });
});

app.listen(3000, () => console.log("App is running, listening on port 3000"));
