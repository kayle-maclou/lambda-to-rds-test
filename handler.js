"use strict";
const { Sequelize } = require("sequelize");
const { QueryTypes } = require("sequelize");
const getSequelizeModels = require("models");

let sequelize = null;

async function loadSequelize() {
  const sequelize = new Sequelize("xml-documents", "admin", "Talia123*", {
    host: "xml-document-database.csjjqz7txezn.us-east-1.rds.amazonaws.com",
    dialect: "mysql",
    pool: {
      /*
       * Lambda functions process one request at a time but your code may issue multiple queries
       * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
       * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
       * be executed in parallel rather than serialized. Careful with executing too many queries in
       * parallel per Lambda function execution since that can bring down your database with an
       * excessive number of connections.
       *
       * Ideally you want to choose a `max` number where this holds true:
       * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
       */
      max: 2,
      /*
       * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
       * in the event of a Lambda function timeout.
       */
      min: 0,
      /*
       * Set this value to 0 so connections are eligible for cleanup immediately after they're
       * returned to the pool.
       */
      idle: 0,
      // Choose a small enough value that fails fast if a connection takes too long to be established.
      acquire: 3000,
      /*
       * Ensures the connection pool attempts to be cleaned up automatically on the next Lambda
       * function invocation, if the previous invocation timed out.
       */
      evict: 60000,
    },
  });

  // or `sequelize.sync()`
  await sequelize.authenticate();
  return sequelize;
}

module.exports.hello = async (event) => {
  try {
    // re-use the sequelize instance across invocations to improve performance
    if (!sequelize) {
      sequelize = await loadSequelize();
    } else {
      // restart connection pool to ensure connections are not re-used across invocations
      sequelize.connectionManager.initPools();

      // restore `getConnection()` if it has been overwritten by `close()`
      if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
        delete sequelize.connectionManager.getConnection;
      }
    }

    const { User } = getSequelizeModels(sequelize);

    const users = await User.findAll();
    // const users = await sequelize.query("SELECT * FROM `Users`", {
    //   type: QueryTypes.SELECT,
    // });
    console.log("RETURN VALUE -----> ", JSON.stringify(users));
    return users;
  } catch (error) {
    console.log("ERROR -----> ", JSON.stringify(error));
    return JSON.stringify(error);
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await sequelize.connectionManager.close();
  }
};
