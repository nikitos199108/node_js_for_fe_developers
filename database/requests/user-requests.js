const moment = require('moment')

const db = require('../database.js')
const helpers = require('../helpers/index.js')

const getUsers = (req, res) => {
    const sql = 'SELECT * FROM Users'
    const params = []

    db.all(sql, params, (err, result) => {
        if (result?.error) {
            res.status(500).json({'error':err.message})
            return
        }
        if (result && result.length) {
            res.json({
                'message':'success',
                'users': result
            })
        } else {
            res.status(500).json({'error':'Sorry, cant find users table!'})
        }
    })
}

const getUser = (req, res) => {
    const sql = 'SELECT * FROM Users WHERE UserName = ?'
    const params = [req.params.username]

    db.all(sql, params, (err, result) => {
        if (result?.error) {
            res.status(500).json({'error':err.message})
            return
        }
        if (result && result.length) {
            res.json({
                'message':'success',
                'users': result
            })
        } else {
            res.status(500).json({'error':'Sorry, cant find requested user!'})
        }
    })
}

const addUser = (req, res) => {
    if (!req.body.username){
        res.status(400).json({'error': 'Enter the user name please!'})
        return
    }

    const sql ='INSERT INTO Users (UserName) VALUES (?)'
    const params =[req.body.username]

    db.run(sql, params, function (err) {
        if (err){
            res.status(500).json({'error': `Sorry, can't create a new user ${err.message}`})
            return
        }
        res.json({
            'message': 'success',
            'user': {
                'UserName': req.body.username,
                'UserId' : this.lastID
            }
        })
    })
}

const deleteUser = (req, res) => {
    const params = [req.params.username]

    db.run(
        'DELETE FROM Users WHERE UserName = ?',
        params,
        function (err) {
            if (err){
                res.status(500).json({'error': res.message})
                return
            }
            if (!this.changes) {
                res.status(500).json({'error': `Sorry, can't delete user with name ${req.params.username}!`})
            } else {
                res.json({'message':`User with name ${req.params.username} was deleted!`, changes: this.changes})
            }
        })
}

const getUsersLogs = (req, res) => {
    const params = [req.params.id]
    const { from, to, limit } = req.query

    if (from && !helpers.dateValidation(from)) {
        res.status(400).json({'error': 'Enter correct date from please!'})
        return
    }
    if (to && !helpers.dateValidation(to)) {
        res.status(400).json({'error': 'Enter correct date to please!'})
        return
    }
    if (limit && !Number(limit)) {
        res.status(400).json({'error': 'Enter correct limit to please!'})
        return
    }

    const startDate = from ? `AND Date > ${Date.parse(from)}` : ''
    const endDate = to ? `AND Date < ${Date.parse(to)}` : ''
    const bound = limit ? `LIMIT ${limit}` : ''
    const sqlGeneral = 'SELECT * FROM Exercises WHERE UserId = ?'
    const sqlWithLimits = `SELECT * FROM Exercises WHERE UserId = ? ${startDate} ${endDate} ${bound}`

    db.all(sqlGeneral, params, (err, rows) => {
        if (err) {
            res.status(500).json({'error':err.message})
            return
        }
        const count = rows.length
        db.all(sqlWithLimits, params, (err, rows) => {
            if (err) {
                res.status(500).json({'error':err.message})
                return
            }
            if (rows && rows.length) {
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
                res.status(500).json({'error':`Sorry can't find exercises for user id ${params}!`});
            }
        })
    })
}

module.exports = {
    getUsers,
    getUser,
    addUser,
    deleteUser,
    getUsersLogs
}