export class ApplicationException extends Error {
    constructor(message: string, public status: number, cause?: unknown) {
        super(message, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);//بتاكد ان الايرور طالع من المكان الصح 
    }

}


export class BadRequestException extends ApplicationException {
    constructor(message: string = 'bad request', cause?: unknown) {
        super(message, 400, cause);
    }

}


export class NotFoundException extends ApplicationException {
    constructor(message: string = 'not found', cause?: unknown) {
        super(message, 404, cause);
    }

}

export class UnAuthorizedException extends ApplicationException {
    constructor(message: string = 'UnAuthorized', cause?: unknown) {
        super(message, 401, cause);
    }

}

export class ForebiddenException extends ApplicationException {
    constructor(message: string = 'Forebidden', cause?: unknown) {
        super(message, 403, cause);
    }

}

export class ConflictException extends ApplicationException {
    constructor(message: string = 'Conflict', cause?: unknown) {
        super(message, 409, cause);
    }

}

export class TooManyRequestsException extends ApplicationException {
    constructor(message: string = 'Too Many Request', cause?: unknown) {
        super(message, 429, cause);
    }

}
