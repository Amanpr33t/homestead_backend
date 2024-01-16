require('express-async-errors')

function getDaysDifference(date2) {
    // Convert both dates to milliseconds
    const date1 = new Date()
    const date1Milliseconds = date1.getTime();
    const date2Milliseconds = date2.getTime();

    // Calculate the difference in milliseconds
    const differenceMilliseconds = Math.abs(date2Milliseconds - date1Milliseconds);

    // Convert the difference back to days
    const differenceDays = Math.ceil(differenceMilliseconds / (1000 * 60 * 60 * 24));

    return differenceDays;
}
module.exports = {
    getDaysDifference
}