const sqlite3 = require("sqlite3");
const { open: openSql } = require("sqlite");

async function openSqlDb() {
  return openSql({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
}

module.exports = openSqlDb;
