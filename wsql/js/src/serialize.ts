import { err, ok, Result } from "neverthrow";

import { type WSQLError, InvalidQuery } from "./errors.js";
import type {
  ClauseWs,
  ClauseStream,
  ExprBool,
  ExprDate,
  ExprInt,
  ExprString,
  Query,
} from "./primitives.js";
import { isPresent } from "./utils.js";

export const serialize = (query: Query): Result<string, WSQLError> => {
  return serializeClauseRequestResponse(query);
};

const serializeClauseRequestResponse = (
  query: Query,
): Result<string, WSQLError> => {
  if (isPresent(query.stream)) {
    return serializeClauseStream(query.stream).map((str) => `stream.${str}`);
  }
  if (isPresent(query.websocket)) {
    return serializeClauseWs(query.websocket).map((str) => `ws.${str}`);
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

const serializeClauseWs = (
  value: ClauseWs,
): Result<string, WSQLError> => {
  if (isPresent(value.createdAt)) {
    return serializeExprDate(value.createdAt).map((str) => `created_at.${str}`);
  }
  if (isPresent(value.direction)) {
    return serializeExprString(value.direction).map((str) => `direction.${str}`);
  }
  if (isPresent(value.raw)) {
    return serializeExprString(value.raw).map((str) => `raw.${str}`);
  }
  if (isPresent(value.format)) {
    return serializeExprString(value.format).map((str) => `format.${str}`);
  }

  return err(new InvalidQuery());
};

const serializeClauseStream = (
  value: ClauseStream,
): Result<string, WSQLError> => {

  if (isPresent(value.host)) {
    return serializeExprString(value.host).map((str) => `host.${str}`);
  }
  if (isPresent(value.path)) {
    return serializeExprString(value.path).map((str) => `path.${str}`);
  }
  if (isPresent(value.source)) {
    return serializeExprString(value.source).map((str) => `source.${str}`);
  }
  if (isPresent(value.protocol)) {
    return serializeExprString(value.protocol).map((str) => `protocol.${str}`);
  }
  if (isPresent(value.port)) {
    return serializeExprInt(value.port).map((str) => `port.${str}`);
  }
  if (isPresent(value.isTLS)) {
    return serializeExprBool(value.isTLS).map((str) => `tls.${str}`);
  }

  return err(new InvalidQuery());
};

const serializeExprInt = (value: ExprInt): Result<string, WSQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};

const serializeExprString = (
  value: ExprString,
): Result<string, WSQLError> => {
  if (value.isRaw) {
    return ok(`${value.operator.toLowerCase()}:/${value.value}/`);
  } else {
    return ok(`${value.operator.toLowerCase()}:${JSON.stringify(value.value)}`);
  }
};

const serializeExprDate = (value: ExprDate): Result<string, WSQLError> => {
  return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
};

const serializeExprBool = (value: ExprBool): Result<string, WSQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};