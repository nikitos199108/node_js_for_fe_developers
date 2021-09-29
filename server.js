const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')

const db = require("./database.js")

const app = express()
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM Users'
  const params = []

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({'error':err.message});
    } else if (rows && rows.length) {
      res.json({
        'message':'success',
        'users': rows
      })
    } else {
      res.status(400).json({'error':'The users table is empty!'});
    }
  });
});

app.get('/api/users/:username', (req, res) => {
  const sql = 'SELECT * FROM Users WHERE UserName = ?'
  const params = [req.params.username]

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({'error':err.message});
    } else if (rows && rows.length) {
      res.json({
        'message':'success',
        'user':rows
      })
    } else {
      res.status(400).json({'error':`User ${params} doesn't exist!`});
    }
  });
});

app.post('/api/users', (req, res) => {
  if (!req.body.username){
    res.status(400).json({'error': 'Enter the user name please!'})
    return;
  }

  const sql ='INSERT INTO Users (UserName) VALUES (?)'
  const params =[req.body.username]

  db.run(sql, params, function (err) {
    if (err){
      if (!req.body.username) {
        res.status(400).json({'error': 'Enter the user name please!'})
      } else {
        res.status(400).json({'error': `Sorry, can't create a new user ${err.message}`})
      }
    } else {
      res.json({
        'message': 'success',
        'user': {
          'UserName': req.body.username,
          'UserId' : this.lastID
        }
      })
    }
  });
})

app.delete('/api/users/:username', (req, res) => {
  const params = [req.params.username]

  db.run(
      'DELETE FROM Users WHERE UserName = ?',
      params,
      function (err) {
        if (err){
          res.status(400).json({'error': res.message})
        } else if (!this.changes) {
          res.json({'message':`User ${req.params.username} doesn't exist!`})
        } else {
          res.json({'message':'deleted', changes: this.changes})
        }
      });
})

app.get('/api/exercises', (req, res) => {
  const sql = 'SELECT * FROM Exercises'
  const params = []

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({'error':err.message});
    } else if (rows && rows.length) {
      const result = rows.map((item) => {
        return {
          ExerciseId: item.ExerciseId,
          UserId: item.UserId,
          Description: item.Description,
          Duration: item.Duration,
          Date: moment(item.Date).format('YYYY-MM-D')
        }
      })
      res.json({
        'message':'success',
        'exercises': result
      })
    } else {
      res.status(400).json({'error':'The exercises table is empty!'});
    }
  });
});

app.post('/api/users/:id/exercises', (req, res) => {
  if (!req.body.description || !req.body.duration){
    res.status(400).json({'error': 'Enter exercise description and duration please!'})
    return;
  }
  if (!req.body.date){
    req.body.date = new Date()
  }

  const userId = req.params.id
  const { description, duration, date } = req.body
  const parsedDate = Date.parse(date)
  const params =[userId, description, duration, parsedDate]
  const exercisesSql ='INSERT INTO Exercises (UserId, Description, Duration, Date) VALUES (?,?,?,?)'
  const testSql = `SELECT Users.UserId,Users.UserName,Exercises.Description,Exercises.Duration,Exercises.Date 
                   FROM Users INNER JOIN Exercises ON Users.UserId=Exercises.UserId
                   WHERE Users.UserId=${userId} AND Exercises.ExerciseId = (SELECT MAX(Exercises.ExerciseId) FROM Exercises)`

  db.run(exercisesSql, params, function (err) {
    if (err){
      res.status(400).json({'error': err.message})
    } else {
      db.get(testSql, [], function (err, result) {
        if (err){
          res.status(400).json({'error': err.message})
        } else {
          res.json({
            'message': 'success',
            'user': {
              'UserId': result.UserId,
              'UserName': result.UserName,
              'Description': result.Description,
              'Duration': result.Duration,
              'Date': moment(result.Date).format('YYYY-MM-D')
            }
          })
        }
      });
    }
  });
})

app.delete('/api/exercises/:exerciseId', (req, res) => {
  const params = [req.params.exerciseId]

  db.run(
      'DELETE FROM Exercises WHERE ExerciseId = ?',
      params,
      function (err) {
        if (err){
          res.status(400).json({'error': res.message})
        } else if (!this.changes) {
          res.json({'message':`Exercise ${req.params.exerciseId} doesn't exist!`})
        } else {
          res.json({'message':'deleted', changes: this.changes})
        }
      });
})

app.get('/api/users/:id/logs', (req, res) => {
  const params = [req.params.id]
  const { from, to, limit } = req.query
  const startDate = from ? `AND Date > ${Date.parse(from)}` : ''
  const endDate = to ? `AND Date < ${Date.parse(to)}` : ''
  const bound = limit ? `LIMIT ${limit}` : ''
  const sqlGeneral = 'SELECT * FROM Exercises WHERE UserId = ?'
  const sqlWithLimits = `SELECT * FROM Exercises WHERE UserId = ? ${startDate} ${endDate} ${bound}`

  db.all(sqlGeneral, params, (err, rows) => {
    if (err) {
      res.status(400).json({'error':err.message});
    } else {
      const count = rows.length
      db.all(sqlWithLimits, params, (err, rows) => {
        if (err) {
          res.status(400).json({'error':err.message});
        } else if (rows && rows.length) {
          const result = rows.map((item) => {
            return {
              Description: item.Description,
              Duration: item.Duration,
              Date: moment(item.Date).format('YYYY-MM-D')
            }
          })
          res.json({
            'message':'success',
            'count': count,
            'exercises': result
          })
        } else {
          res.status(400).json({'error':`Exercise for user id ${params} doesn't exist!`});
        }
      });

    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
