const Status = {
    STATUS_TRUE: true,
    STATUS_FALSE: false
}

const StatusCode = {
    HTTP_OK: 200,
    HTTP_BAD_REQUEST: 400,
    HTTP_VALIDATION: 400,
    HTTP_UNAUTHORIZED: 401,
    HTTP_INTERNAL_SERVER_ERROR: 500
}

const StatusMessage = {
    HTTP_OK: "Success",
    HTTP_BAD_REQUEST: "Bad Request.",
    HTTP_VALIDATION: "Enter correct details.",
    HTTP_UNAUTHORIZED: "Unauthorized.",
    HTTP_INTERNAL_SERVER_ERROR: "Internal Server Error.",
    CATCH_ERROR                 : "Something went wrong. Please try again.",
}

module.exports = {
    Status,
    StatusCode,
    StatusMessage
};