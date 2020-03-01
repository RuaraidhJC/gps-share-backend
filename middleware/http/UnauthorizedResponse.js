var HttpResponse = require('./HttpResponse');

module.exports = UnauthorizedResponse;

function UnauthorizedResponse (message, errorCode) {
    HttpResponse.call(
        this, null, message || 'Unauthorized', 401, errorCode, null);
}