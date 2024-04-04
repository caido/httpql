import { err, ok, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery, MissingPreset } from "./errors.js";
import type {
  ClauseRequest,
  ClauseResponse,
  ExprInt,
  ExprPreset,
  ExprString,
  Options,
  Query,
} from "./primitives.js";
import { ExprPresetSource } from "./primitives.js";
import { isAbsent, isPresent } from "./utils.js";

export const serialize = (
  query: Query,
  options: Options = {
    presets: undefined,
  },
): Result<string, HTTPQLError> => {
  return serializeClauseRequestResponse(query, options);
};

const serializeClauseRequestResponse = (
  query: Query,
  options: Options,
): Result<string, HTTPQLError> => {
  if (isPresent(query.preset)) {
    return serializeExprPreset(query.preset, options);
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
      serializeClauseRequestResponse(query.AND[0]!, options),
      serializeClauseRequestResponse(query.AND[1]!, options),
    ]).map(([left, right]) => `(${left} and ${right})`);
  }
  if (isPresent(query.OR)) {
    if (query.OR.length !== 2) {
      return err(new InvalidQuery());
    }
    return Result.combine([
      serializeClauseRequestResponse(query.OR[0]!, options),
      serializeClauseRequestResponse(query.OR[1]!, options),
    ]).map(([left, right]) => `(${left} or ${right})`);
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
  return err(new InvalidQuery());
};

const serializeExprPreset = (
  preset: ExprPreset,
  options: Options,
): Result<string, HTTPQLError> => {
  const match = options.presets?.find((p) => p.id === preset.id);

  if (isAbsent(match)) {
    return err(new MissingPreset(preset.id));
  }

  switch (preset.source) {
    case ExprPresetSource.Name:
      return ok(`preset:"${match.name}"`);
    case ExprPresetSource.Alias:
      return ok(`preset:${match.alias}`);
  }
};

const serializeExprInt = (value: ExprInt): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};

const serializeExprString = (
  value: ExprString,
): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
};
