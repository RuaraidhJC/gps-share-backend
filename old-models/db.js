"use strict";

const Sequelize = require('sequelize');
const db = {};
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

const sequelize = new Sequelize({
  storage: './db.sqlite',
  dialect: 'sqlite',
  logging: console.log,
  define: {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] }
    }
  }
});

const Friend = sequelize.define('Friend', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      sender: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      receiver: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      isConfirmed: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      }
    }
);

const Position = sequelize.define('Position', {
  latitude: {
    type: Sequelize.DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: Sequelize.DataTypes.FLOAT,
    allowNull: false
  }
});

const User = sequelize.define('User', {
  id: {
    type: Sequelize.DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => uuid()
  },
  email: {
    type: Sequelize.DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  token: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true
  },
  notificationToken: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true
  },


});

User.beforeCreate((user) => {
  // Hash password systematically on user creation
  let password = bcrypt.hashSync(user.password, 10);
  user.password = password;
  return password;
});

User.prototype.checkPassword = async function(password)  {
  return bcrypt.compareSync(password, this.password);
};

User.hasMany(Friend);
Friend.belongsTo(User);

User.hasMany(Position);
Position.belongsTo(User);

db[User.name] = User;
db[Friend.name] = Friend;

// Make sequelize and Sequelize objects available without importing them each time
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
