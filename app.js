const db = require('./models/db');
const User = db["user"];
const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/jwt');
const { Expo } = require('expo-server-sdk');
const logger = require('morgan');
// Create a new Expo SDK client
let expo = new Expo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

app.get('/', checkAuth.checkToken, function (req, res) {
  console.log(req.user)
  res.send('API')
});

app.post('/register', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let notificationToken = req.body.notificationToken;

    if (email && password) {
      const find = await User.findOne({where: {email: email}});
      if (!find) {
        let token = jwt.sign({email},
          "epitech"
        );
        console.log(token);
        // return the JWT token for the future API calls
        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token
        });
        User.create({email: email, password: password, token: token, notificationToken: notificationToken});
      } else {
        res.json({
          success: false,
          message: 'User already exists',
        });
      }
    } else {
      res.json({
        success: false,
        message: 'Inputs missing',
      });
    }
});

app.post('/login', async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let notificationToken = req.body.notificationToken;

  if (email && password) {
    const user = await User.findOne({where: {email}});
    if (!user || !await user.checkPassword(password)) {
      return res.json({
        success: false,
        message: 'Incorrect email or password'
      });
    }
    let token = jwt.sign({email}, 'epitech');
    user.update({notificationToken});
    // return the JWT token for the future API calls
    res.json({
      success: true,
      message: 'Authentication successful!',
      token: token
    });
  } else {
    res.json({
      success: false,
      message: 'Authentication failed! Please check the request'
    });
  }
});

app.post('/push', checkAuth.checkToken, async function (req, res)  {
  const user = req.user;
  const email = req.body.to;
  const address = req.body.address;
  const expeditor = await User.findOne({where: {email}});
  const pushToken = expeditor.notificationToken;
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }
  let messages = [];
  // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
  messages.push({
    to: pushToken,
    title: user.email + " vous a envoyé sa position",
    _displayInForeground: true,
    sound: 'default',
    body: address,
  });
  let chunk = expo.chunkPushNotifications(messages)[0];
  let ticketChunk = await expo.sendPushNotificationsAsync(chunk);


});

app.listen(3100, function () {
  console.log('Example app listening on port 3000!')
});
