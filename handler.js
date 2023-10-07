"use strict";
const { sequelize, User } = require("models");

module.exports.hello = async (event) => {
  try {
    const users = await User.findAll();
    console.log("RETURN VALUE -----> ", JSON.stringify(users));
    return users;
  } catch (error) {
    console.log(JSON.stringify(error));
    return JSON.stringify(error);
  }
};
