"use strict";
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  // Add a last connection field?
  const User = sequelize.define('user', {

    /**
     * Attributes
     */

    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuid()
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }   // More validators on the password (ex: no '12345' or 'password' passwords)
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {

    /**
     * Validators
     */

    validate: {
    },


    /**
     *  Default scope
     */

    defaultScope: {
    },

    /**
     * Scopes
     */

    scopes: {

    },

  });

  /**
   * Associations
   */



  /**
   * Instance methods
   */


  /**
   * Hooks
   */

  User.beforeCreate((user) => {
    // Hash password systematically on user creation
    let password = bcrypt.hashSync(user.password, 10);
    user.password = password;
    return password;
  });

  User.beforeUpdate((user, options, fn) => {

  });

  User.prototype.checkPassword = async function(password)  {
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};
