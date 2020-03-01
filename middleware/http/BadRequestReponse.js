var HttpResponse = require('./HttpResponse');

module.exports = BadRequestResponse;

function BadRequestResponse (message, errorCode) {
    HttpResponse.call(
        this, null, message || 'Bad Request', 400, errorCode, null);
}