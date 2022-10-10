// from milli to seconds 10 vs. 13
const trimTimestamp = (timestamp) => {
  return (timestamp.toString().length === 13)
    ? timestamp = parseInt((timestamp / 1000).toString().split(".")[0])
    : timestamp;
}

// from https://stackoverflow.com/questions/8083410/how-can-i-set-the-default-timezone-in-node-js
const getDateTime = (format = '') => {
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  if (format === 'full') {
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${month}/${date}/${year}`;
  }
}

module.exports = {
  trimTimestamp,
  getDateTime
};
