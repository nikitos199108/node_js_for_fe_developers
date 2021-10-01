const moment = require('moment')

const db = require('../database.js')
const helpers = require('../helpers/index.js')

const getExercises = (req, res) => {
    const sql = 'SELECT * FROM Exercises'
    const params = []

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({'error':err.message})
            return
        }
        if (rows && rows.length) {
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
            res.status(500).json({'error':'Sorry, cant find exercises table!'})
        }
    })
}

const addExercise = (req, res) => {
    let { description, duration, date } = req.body

    if (!description){
        res.status(400).json({'error': 'Enter exercise description please!'})
        return;
    }
    if (!duration){
        res.status(400).json({'error': 'Enter exercise duration please!'})
        return;
    }
    if (!date){
        date = new Date()
    }

    const isDateValid = helpers.dateValidation(date)

    if (!isDateValid) {
        res.status(400).json({'error': 'Enter correct date please!'})
        return;
    }

    const userId = req.params.id
    const parsedDate = Date.parse(date)
    const params =[userId, description, duration, parsedDate]
    const exercisesSql ='INSERT INTO Exercises (UserId, Description, Duration, Date) VALUES (?,?,?,?)'
    const testSql = `SELECT Users.UserId,Users.UserName,Exercises.Description,Exercises.Duration,Exercises.Date 
                   FROM Users INNER JOIN Exercises ON Users.UserId=Exercises.UserId
                   WHERE Users.UserId=${userId} AND Exercises.ExerciseId = (SELECT MAX(Exercises.ExerciseId) FROM Exercises)`

    db.run(exercisesSql, params, function (err) {
        if (err){
            res.status(500).json({'error': err.message})
            return
        }
        db.get(testSql, [], function (err, result) {
            if (err){
                res.status(500).json({'error': err.message})
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
        })
    })
}

const deleteExercise = (req, res) => {
    const params = [req.params.exerciseId]

    db.run(
        'DELETE FROM Exercises WHERE ExerciseId = ?',
        params,
        function (err) {
            if (err){
                res.status(500).json({'error': res.message})
                return
            }
            if (!this.changes) {
                res.json({'message':`Sorry, can't find exercise with id ${req.params.exerciseId}!`})
            } else {
                res.json({'message': `Exercise with id ${req.params.exerciseId} was deleted!`, changes: this.changes})
            }
        })
}

module.exports = {
    getExercises,
    addExercise,
    deleteExercise
}