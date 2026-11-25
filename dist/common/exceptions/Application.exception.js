"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestsException = exports.ConflictException = exports.ForebiddenException = exports.UnAuthorizedException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    status;
    constructor(message, status, cause) {
        super(message, { cause });
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message = 'bad request', cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationException {
    constructor(message = 'not found', cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class UnAuthorizedException extends ApplicationException {
    constructor(message = 'UnAuthorized', cause) {
        super(message, 401, cause);
    }
}
exports.UnAuthorizedException = UnAuthorizedException;
class ForebiddenException extends ApplicationException {
    constructor(message = 'Forebidden', cause) {
        super(message, 403, cause);
    }
}
exports.ForebiddenException = ForebiddenException;
class ConflictException extends ApplicationException {
    constructor(message = 'Conflict', cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class TooManyRequestsException extends ApplicationException {
    constructor(message = 'Too Many Request', cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
