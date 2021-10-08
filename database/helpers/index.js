const dateValidation = (date) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/

    if(!date.match(regEx)) return false

    const seconds = new Date(date).getTime()

    return !(!seconds && seconds !== 0)
}

module.exports = {
    dateValidation
}