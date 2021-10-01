const sqlite3 = require('sqlite3').verbose()
const QUERIES = require('./queries')

const DATABASE = 'db.sqlite'

const db = new sqlite3.Database(DATABASE, err => {
    if (err) {
        return console.error(err.message)
    }
    console.log('Successful connection to the database')
});

(async () => {
    try {
        await db.run(`PRAGMA foreign_keys = ON`)
        await db.run(QUERIES.SQL_USERS,
            (err) => {
                if (err) {
                    console.error(err.message)
                }else{
                    let insertUser = 'INSERT INTO Users (UserName) VALUES (?)'
                    db.run(insertUser, ['admin123456'])
                    db.run(insertUser, ['user123456'])
                    console.error('Table users just created')
                }
            })
        await db.run(QUERIES.SQL_EXERCISES,
            (err) => {
                if (err) {
                    console.error(err.message)
                }else{
                    let insertExercises = 'INSERT INTO exercises (UserId,Description,Duration,Date) VALUES (?,?,?,?)'
                    db.run(insertExercises, ['1','test desc 1','test duration 1',9781628])
                    db.run(insertExercises, ['2','test desc 2','test duration 2',982374986922])
                    console.error('Table exercises just created')
                }
            })
    } catch (e) { return console.error(e.message) }
})();

module.exports = db