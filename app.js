const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const passport = require('passport');
const flash = require('connect-flash');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const db = require('./models/index');

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({
  secret: 'ilovescotchscotchyscotchscotch', // session secret
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static('public'));
// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
db.sync().then(() => {
  app.listen(port);
  console.log('The magic happens on port ' + port);
});


/*app.post('/push', checkAuth.checkToken, async function (req, res)  {


const { Expo } = require('expo-server-sdk');
const logger = require('morgan');
// Create a new Expo SDK client
let expo = new Expo();


  const user = req.user;
  const email = req.body.to;
  const address = req.body.address;
  const coords = req.body.coordinate
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
    data: {coordinate: coords, email: user.email}
  });
  let chunk = expo.chunkPushNotifications(messages)[0];
  let ticketChunk = await expo.sendPushNotificationsAsync(chunk);

  return res.send(200);


});*/

