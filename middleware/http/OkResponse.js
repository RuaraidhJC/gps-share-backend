var HttpResponse = require('./HttpResponse');

module.exports = OkResponse;

function OkResponse (data, message, notification) {
    HttpResponse.call(
        this, data, message || 'OK', 200, undefined, notification, true);
}