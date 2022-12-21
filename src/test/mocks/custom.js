const { readFile } = require("fs/promises");
const { resolve, dirname } = require("path");

module.exports = async function (tokenCollectionPath) {
  const fileContent = await readFile(tokenCollectionPath, {
    encoding: "utf-8",
  });

  return JSON.parse(fileContent).tokens;
};
