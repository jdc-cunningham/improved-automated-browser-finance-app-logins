// from milli to seconds 10 vs. 13
const trimTimestamp = (timestamp) => {
  return (timestamp.toString().length === 13)
    ? timestamp = parseInt((timestamp / 1000).toString().split(".")[0])
    : timestamp;
}

module.exports = {
  trimTimestamp
};
