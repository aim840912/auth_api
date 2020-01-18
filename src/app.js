require('../src/db/mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const cors=require('cors')

const authRoutes = require('../src/routes/auth');
const taskRoutes = require('../src/routes/task');

const app = express()

app.use(bodyParser.json());

const corsOptions = {
  origin: [
    'http://localhost:8080',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions));

app.use('/auth', authRoutes);
app.use(taskRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  console.log('error: ' + error)
  console.log('status: ' + status)
  res.status(status).json({ message: message, data: data });
});


module.exports = app