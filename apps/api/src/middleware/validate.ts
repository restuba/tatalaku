import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";

type ValidateTarget = "body" | "params" | "query";

/**
 * Middleware factory: validates req[target] against the given Zod schema.
 * On failure, formats Zod issues into a human-readable message and throws ValidationError.
 */
export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const messages = (result.error as ZodError).issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      next(new ValidationError(messages));
      return;
    }

    // Overwrite with parsed (and sanitized/coerced) data
    Object.defineProperty(req, target, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };
}
