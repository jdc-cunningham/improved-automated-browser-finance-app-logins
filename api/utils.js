// from milli to seconds 10 vs. 13
const trimTimestamp = (timestamp) => {
  return (timestamp.toString().length === 13)
    ? timestamp = timestamp / 1000
    : timestamp;
}

module.exports = {
  trimTimestamp
};
