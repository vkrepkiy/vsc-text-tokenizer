module.exports = async function (resultsCollection) {
  return resultsCollection.reduce((result, item) => {
    result[item.token] = item.value;
    return result;
  }, {});
};
