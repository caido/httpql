import { err, ok, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "./errors.js";
import type {
  ClauseRequest,
  ClauseResponse,
  ClauseRow,
  ExprDate,
  ExprInt,
  ExprPreset,
  ExprString,
  Query,
} from "./primitives.js";
import { isPresent } from "./utils.js";

export const serialize = (query: Query): Result<string, HTTPQLError> => {
  return serializeClauseRequestResponse(query);
};

const serializeClauseRequestResponse = (
  query: Query,
): Result<string, HTTPQLError> => {
  if (isPresent(query.row)) {
    return serializeClauseRow(query.row).map((str) => `row.${str}`);
  }
  if (isPresent(query.preset)) {
    return serializeExprPreset(query.preset);
  }
  if (isPresent(query.request)) {
    return serializeClauseRequest(query.request).map((str) => `req.${str}`);
  }
  if (isPresent(query.response)) {
    return serializeClauseResponse(query.response).map((str) => `resp.${str}`);
  }
  if (isPresent(query.AND)) {
    if (query.AND.length !== 2) {
      return err(new InvalidQuery());
    }
    return Result.combine([
      serializeClauseRequestResponse(query.AND[0]),
      serializeClauseRequestResponse(query.AND[1]),
    ]).map(([left, right]) => `(${left} and ${right})`);
  }
  if (isPresent(query.OR)) {
    if (query.OR.length !== 2) {
      return err(new InvalidQuery());
    }
    return Result.combine([
      serializeClauseRequestResponse(query.OR[0]),
      serializeClauseRequestResponse(query.OR[1]),
    ]).map(([left, right]) => `(${left} or ${right})`);
  }
  return err(new InvalidQuery());
};

const serializeClauseRow = (value: ClauseRow): Result<string, HTTPQLError> => {
  if (isPresent(value.id)) {
    return serializeExprInt(value.id).map((str) => `id.${str}`);
  }
  return err(new InvalidQuery());
};

const serializeClauseRequest = (
  value: ClauseRequest,
): Result<string, HTTPQLError> => {
  if (isPresent(value.fileExtension)) {
    return serializeExprString(value.fileExtension).map((str) => `ext.${str}`);
  }
  if (isPresent(value.host)) {
    return serializeExprString(value.host).map((str) => `host.${str}`);
  }
  if (isPresent(value.method)) {
    return serializeExprString(value.method).map((str) => `method.${str}`);
  }
  if (isPresent(value.path)) {
    return serializeExprString(value.path).map((str) => `path.${str}`);
  }
  if (isPresent(value.port)) {
    return serializeExprInt(value.port).map((str) => `port.${str}`);
  }
  if (isPresent(value.query)) {
    return serializeExprString(value.query).map((str) => `query.${str}`);
  }
  if (isPresent(value.raw)) {
    return serializeExprString(value.raw).map((str) => `raw.${str}`);
  }
  if (isPresent(value.createdAt)) {
    return serializeExprDate(value.createdAt).map((str) => `created_at.${str}`);
  }
  return err(new InvalidQuery());
};

const serializeClauseResponse = (
  value: ClauseResponse,
): Result<string, HTTPQLError> => {
  if (isPresent(value.raw)) {
    return serializeExprString(value.raw).map((str) => `raw.${str}`);
  }
  if (isPresent(value.statusCode)) {
    return serializeExprInt(value.statusCode).map((str) => `code.${str}`);
  }
  if (isPresent(value.roundtripTime)) {
    return serializeExprInt(value.roundtripTime).map(
      (str) => `roundtrip.${str}`,
    );
  }
  return err(new InvalidQuery());
};

const serializeExprPreset = (
  preset: ExprPreset,
): Result<string, HTTPQLError> => {
  if ("alias" in preset) {
    return ok(`preset:${preset.alias}`);
  } else {
    return ok(`preset:"${preset.name}"`);
  }
};

const serializeExprInt = (value: ExprInt): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};

const serializeExprString = (
  value: ExprString,
): Result<string, HTTPQLError> => {
  if (value.isRaw) {
    return ok(`${value.operator.toLowerCase()}:/${value.value}/`);
  } else {
    return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
  }
};

const serializeExprDate = (value: ExprDate): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
};
