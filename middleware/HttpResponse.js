const Expo = require('expo-server-sdk');
let expo = new Expo.Expo();
const OkResponse = require('./http/OkResponse');

module.exports.HttpResponse = require('./http/HttpResponse');
module.exports.OkResponse = require('./http/OkResponse');
module.exports.BadRequestResponse = require('./http/BadRequestReponse');
module.exports.UnauthorizedResponse = require('./http/UnauthorizedResponse');
module.exports.Middleware = HttpResponse;

function HttpResponse(thrownResponse, req, res, next) {
    if (! thrownResponse instanceof OkResponse) {
        console.error(thrownResponse);
    }
    if (thrownResponse.notification) {
        (async () => {
            const User = require('../models/index')['User'];
            const {userList, message, body} = {...thrownResponse.notification};
            let messages = [];
            for (let email of userList) {
                const {notificationToken} = await User.findOne({where:{email: email}});
                try {
                    Expo.isExpoPushToken(notificationToken);
                    messages.push({
                        to: notificationToken,
                        title: message,
                        _displayInForeground: true,
                        sound: 'default',
                        body: body,
                    })
                } catch (error) {

                }

            }
            if (messages.length) {
                let chunks = expo.chunkPushNotifications(messages);
                for (let chunk of chunks) {
                    await expo.sendPushNotificationsAsync(chunk);
                }
            }
        })();
    }
    res.status(thrownResponse.status || 500).send(thrownResponse);
    next();
}