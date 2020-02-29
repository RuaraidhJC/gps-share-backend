"use strict";
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  // Add a last connection field?
  const User = sequelize.define('User', {

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
    profileUrl: {
      type:DataTypes.STRING,
      allowNull: false,
      defaultValue: () => `/images/avatar-${Math.floor(Math.random() * 59) + 100}.png`
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }   // More validators on the password (ex: no '12345' or 'password' passwords)
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
      sanitized: {
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt']
        }
      }
    },

  });

  /**
   * Associations
   */

  User.associate = function(models) {
    models['User'].belongsToMany(models['User'], {as: 'friends', through: models['FriendReq']});
    models['User'].hasMany(models['FriendReq']);
  };

  /**
   * Instance methods
   */


  /**
   * Hooks
   */

  User.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

// checking if password is valid
  User.validPassword = async function(password, userID) {
    const user = await User.unscoped().findByPk(userID);
    return bcrypt.compareSync(password, user.password);
  };


  User.beforeCreate((user) => {
    // Hash password systematically on user creation
    const password =  User.generateHash(user.password);
    user.password = password;
    return password;
  });


  User.prototype.checkPassword = async function(password)  {
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};
