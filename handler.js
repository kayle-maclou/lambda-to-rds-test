"use strict";
const { Sequelize } = require("sequelize");
const getSequelizeModels = require("models");
const serverless = require("serverless-http");
const express = require("express");
const app = express();

async function loadSequelize(sequelize) {
  sequelize = new Sequelize("xml-documents", "admin", "Talia123*", {
    host: "xml-document-database.csjjqz7txezn.us-east-1.rds.amazonaws.com",
    dialect: "mysql",
    pool: {
      max: 2,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: 60000,
    },
  });
  // or `sequelizehandler.sync()`
  await sequelize.authenticate();
  return sequelize;
}

app.get("/", async (req, res, next) => {
  let sequelize = null;
  try {
    if (!sequelize) {
      sequelize = await loadSequelize(sequelize);
    } else {
      sequelize.connectionManager.initPools();
      if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
        delete sequelize.connectionManager.getConnection;
      }
    }

    const { User } = getSequelizeModels(sequelize);
    const users = await User.findAll();
    console.log("RETURN VALUE -----> ", JSON.stringify(users));
    return res.status(200).json(JSON.stringify(users));
  } catch (error) {
    console.log("ERROR -----> ", JSON.stringify(error));
    return JSON.stringify(error);
  } finally {
    await sequelize.connectionManager.close();
  }
});

module.exports.handler = serverless(app);

// async function loadSequelize(sequelize) {
//   sequelize = new Sequelize("xml-documents", "admin", "Talia123*", {
//     host: "xml-document-database.csjjqz7txezn.us-east-1.rds.amazonaws.com",
//     dialect: "mysql",
//     pool: {
//       max: 2,
//       min: 0,
//       idle: 0,
//       acquire: 3000,
//       evict: 60000,
//     },
//   });
//   // or `sequelizehandler.sync()`
//   await sequelize.authenticate();
//   return sequelize;
// }

// module.exports.hello = async (event) => {
//   let sequelize = null;
//   try {
//     if (!sequelize) {
//       sequelize = await loadSequelize(sequelize);
//     } else {
//       sequelize.connectionManager.initPools();
//       if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
//         delete sequelize.connectionManager.getConnection;
//       }
//     }

//     const { User } = getSequelizeModels(sequelize);
//     const users = await User.findAll();
//     console.log("RETURN VALUE -----> ", JSON.stringify(users));
//     return users;
//   } catch (error) {
//     console.log("ERROR -----> ", JSON.stringify(error));
//     return JSON.stringify(error);
//   } finally {
//     await sequelize.connectionManager.close();
//   }
// };
