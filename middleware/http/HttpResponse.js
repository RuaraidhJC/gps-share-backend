module.exports = HttpResponse;

function HttpResponse (data, message, httpStatusCode, errorCode, notification, success) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.type = this.constructor.name;
    this.message = message + '';
    this.status = parseInt(httpStatusCode, 10);
    this.success = !!success;
    notification && (this.notification = notification);
    errorCode && (this.code = errorCode);
    data && (this.data = data);
}