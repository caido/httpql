import { err, ok, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "./errors.js";
import {
  OperatorString,
  type ClauseHeader,
  type ClauseRequest,
  type ClauseResponse,
  type ClauseRow,
  type ExprBool,
  type ExprDate,
  type ExprInt,
  type ExprPreset,
  type ExprSource,
  type ExprString,
  type Query,
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
  if (isPresent(query.source)) {
    return serializeExprSource(query.source);
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
  return ok("()");
};

const serializeClauseRow = (value: ClauseRow): Result<string, HTTPQLError> => {
  if (isPresent(value.id)) {
    return serializeExprInt(value.id).map((str) => `id.${str}`);
  }
  return err(new InvalidQuery());
};

const serializeClauseHeader = (
  value: ClauseHeader,
): Result<string, HTTPQLError> => {
  if (
    isPresent(value.name) &&
    isPresent(value.value) &&
    value.name.operator === OperatorString.Eq &&
    !value.name.isRaw
  ) {
    return serializeExprString(value.value).map(
      (str) => `header[${JSON.stringify(value.name!.value)}].${str}`,
    );
  }
  if (isPresent(value.name)) {
    return serializeExprString(value.name).map((str) => `header.name.${str}`);
  }
  if (isPresent(value.value)) {
    return serializeExprString(value.value).map((str) => `header.value.${str}`);
  }
  return err(new InvalidQuery());
};

const serializeClauseRequest = (
  value: ClauseRequest,
): Result<string, HTTPQLError> => {
  if (isPresent(value.body)) {
    return serializeExprString(value.body).map((str) => `body.${str}`);
  }
  if (isPresent(value.createdAt)) {
    return serializeExprDate(value.createdAt).map((str) => `created_at.${str}`);
  }
  if (isPresent(value.fileExtension)) {
    return serializeExprString(value.fileExtension).map((str) => `ext.${str}`);
  }
  if (isPresent(value.header)) {
    return serializeClauseHeader(value.header).map((str) => `header${str}`);
  }
  if (isPresent(value.host)) {
    return serializeExprString(value.host).map((str) => `host.${str}`);
  }
  if (isPresent(value.isTLS)) {
    return serializeExprBool(value.isTLS).map((str) => `tls.${str}`);
  }
  if (isPresent(value.length)) {
    return serializeExprInt(value.length).map((str) => `len.${str}`);
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
  return err(new InvalidQuery());
};

const serializeClauseResponse = (
  value: ClauseResponse,
): Result<string, HTTPQLError> => {
  if (isPresent(value.body)) {
    return serializeExprString(value.body).map((str) => `body.${str}`);
  }
  if (isPresent(value.header)) {
    return serializeClauseHeader(value.header).map((str) => `header${str}`);
  }
  if (isPresent(value.length)) {
    return serializeExprInt(value.length).map((str) => `len.${str}`);
  }
  if (isPresent(value.raw)) {
    return serializeExprString(value.raw).map((str) => `raw.${str}`);
  }
  if (isPresent(value.roundtripTime)) {
    return serializeExprInt(value.roundtripTime).map(
      (str) => `roundtrip.${str}`,
    );
  }
  if (isPresent(value.statusCode)) {
    return serializeExprInt(value.statusCode).map((str) => `code.${str}`);
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
    return ok(`${value.operator.toLowerCase()}:${JSON.stringify(value.value)}`);
  }
};

const serializeExprDate = (value: ExprDate): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
};

const serializeExprBool = (value: ExprBool): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};

const serializeExprSource = (
  value: ExprSource,
): Result<string, HTTPQLError> => {
  return ok(`source:"${value.name}"`);
};
