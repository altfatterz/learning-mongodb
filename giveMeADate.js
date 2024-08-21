function giveMeADate(year, month, day = 1) {
    !year || !month ? new Error("Year and month are required") : null
    month = typeof month === "number" && month < 10 ?  `0${month}` : month
    day = typeof day === "number" && day < 10 ? `0${day}` : day
    return ISODate(`${year}-${month}-${day}T00:00:00.000Z`);
}