const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const userRequests = require('./database/requests/user-requests.js')
const exercisesRequests = require('./database/requests/exercises-requests.js')

const app = express()
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/users', (req, res) => {
  userRequests.getUsers(req, res)
})

app.get('/api/users/:username', (req, res) => {
  userRequests.getUser(req, res)
})

app.post('/api/users', (req, res) => {
  userRequests.addUser(req, res)
})

app.delete('/api/users/:username', (req, res) => {
  userRequests.deleteUser(req, res)
})

app.get('/api/exercises', (req, res) => {
  exercisesRequests.getExercises(req, res)
})

app.post('/api/users/:id/exercises', (req, res) => {
  exercisesRequests.addExercise(req, res)
})

app.delete('/api/exercises/:exerciseId', (req, res) => {
  exercisesRequests.deleteExercise(req, res)
})

app.get('/api/users/:id/logs', (req, res) => {
  userRequests.getUsersLogs(req, res)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
