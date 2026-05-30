export type ValidationFieldError = {
  field: string;
  message: string;
};

type ApiErrorBody = {
  error?:
    | {
        message?: string | ValidationFieldError[];
        timestamp?: string;
      }
    | string;
  message?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", body?: unknown) {
    super(401, message, body);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends ApiError {
  readonly fields: ValidationFieldError[];

  constructor(fields: ValidationFieldError[], body?: unknown) {
    const summary = fields.map((f) => f.message).join("; ") || "Validation failed";
    super(400, summary, body);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

function isValidationFieldArray(
  value: unknown,
): value is ValidationFieldError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "message" in item &&
        typeof item.field === "string" &&
        typeof item.message === "string",
    )
  );
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | undefined;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = undefined;
  }

  const { status } = response;

  if (status === 401) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : "Unauthorized";
    return new UnauthorizedError(message, body);
  }

  if (status === 400) {
    const errorPayload = body?.error;
    if (errorPayload && typeof errorPayload === "object") {
      const nested = errorPayload.message;
      if (isValidationFieldArray(nested)) {
        return new ValidationError(nested, body);
      }
    }
  }

  const errorPayload = body?.error;
  const nestedMessage =
    errorPayload && typeof errorPayload === "object"
      ? errorPayload.message
      : undefined;

  const fallbackMessage =
    typeof nestedMessage === "string"
      ? nestedMessage
      : typeof body?.message === "string"
        ? body.message
        : `Request failed with status ${String(status)}`;

  return new ApiError(status, fallbackMessage, body);
}
