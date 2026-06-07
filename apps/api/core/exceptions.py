from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str) -> None:
        super().__init__(status_code=status_code, detail={"detail": detail, "code": code})
        self.code = code


class ConflictError(AppException):
    def __init__(self, detail: str, code: str = "CONFLICT") -> None:
        super().__init__(status.HTTP_409_CONFLICT, detail, code)


class NotFoundError(AppException):
    def __init__(self, detail: str, code: str = "NOT_FOUND") -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, detail, code)


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Tidak memiliki akses", code: str = "AUTH_ERROR") -> None:
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail, code)


class BadRequestError(AppException):
    def __init__(self, detail: str, code: str = "BAD_REQUEST") -> None:
        super().__init__(status.HTTP_400_BAD_REQUEST, detail, code)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        payload = exc.detail if isinstance(exc.detail, dict) else {"detail": str(exc.detail), "code": exc.code}
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict):
            payload = exc.detail
        else:
            payload = {"detail": str(exc.detail), "code": "HTTP_ERROR"}
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors(), "code": "VALIDATION_ERROR"},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, __exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Terjadi kesalahan internal", "code": "INTERNAL_SERVER_ERROR"},
        )
