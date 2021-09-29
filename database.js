const sqlite3 = require('sqlite3').verbose()

const DATABASE = 'db.sqlite'

const db = new sqlite3.Database(DATABASE, (err) => {
    if (err) {
        console.error('Cannot open database')
        console.error(err.message)
        throw err
    }else{
        console.log('Connected to database.')
        db.run(`PRAGMA foreign_keys = ON`);
        db.run(`CREATE TABLE Users (
            UserId INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT UNIQUE NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error(err.message)
                }else{
                    let insertUser = 'INSERT INTO Users (UserName) VALUES (?)'
                    db.run(insertUser, ['admin123456'])
                    db.run(insertUser, ['user123456'])
                    console.error('Table users just created')
                }
            });
        db.run(`CREATE TABLE Exercises (
            ExerciseId INTEGER PRIMARY KEY AUTOINCREMENT,
            UserId INTEGER NOT NULL,
            Description TEXT NOT NULL,
            Duration TEXT NOT NULL,
            Date INTEGER,
            FOREIGN KEY(UserId) REFERENCES Users(UserId)
            )`,
            (err) => {
                if (err) {
                    console.error(err.message)
                }else{
                    let insertExercises = 'INSERT INTO exercises (UserId,Description,Duration,Date) VALUES (?,?,?,?)'
                    db.run(insertExercises, ['1','test desc 1','test duration 1',9781628])
                    db.run(insertExercises, ['2','test desc 2','test duration 2',982374986922])
                    console.error('Table exercises just created')
                }
            });
    }
});

module.exports = db