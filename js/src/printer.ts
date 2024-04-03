import { err, ok, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery, MissingPreset } from "./errors";
import type {
  FilterClauseRequest,
  FilterClauseRequestResponse,
  FilterClauseResponse,
  FilterExprInt,
  FilterExprPreset,
  FilterExprString,
  Options,
} from "./primitives";
import { FilterExprPresetSource } from "./primitives";
import { isAbsent, isPresent } from "./utils";

export const print = (
  query: FilterClauseRequestResponse,
  options: Options,
): Result<string, HTTPQLError> => {
  return printClauseRequestResponse(query, options);
};

const printClauseRequestResponse = (
  query: FilterClauseRequestResponse,
  options: Options,
): Result<string, HTTPQLError> => {
  if (isPresent(query.preset)) {
    return printExprPreset(query.preset, options);
  }
  if (isPresent(query.request)) {
    return printClauseRequest(query.request).map((str) => `req.${str}`);
  }
  if (isPresent(query.response)) {
    return printClauseResponse(query.response).map((str) => `resp.${str}`);
  }
  if (isPresent(query.AND)) {
    if (query.AND.length !== 2) {
      return err(new InvalidQuery());
    }
    return Result.combine([
      printClauseRequestResponse(query.AND[0]!, options),
      printClauseRequestResponse(query.AND[1]!, options),
    ]).map(([left, right]) => `(${left} and ${right})`);
  }
  if (isPresent(query.OR)) {
    if (query.OR.length !== 2) {
      return err(new InvalidQuery());
    }
    return Result.combine([
      printClauseRequestResponse(query.OR[0]!, options),
      printClauseRequestResponse(query.OR[1]!, options),
    ]).map(([left, right]) => `(${left} or ${right})`);
  }
  return err(new InvalidQuery());
};

const printClauseRequest = (
  value: FilterClauseRequest,
): Result<string, HTTPQLError> => {
  if (isPresent(value.fileExtension)) {
    return printExprString(value.fileExtension).map((str) => `ext.${str}`);
  }
  if (isPresent(value.host)) {
    return printExprString(value.host).map((str) => `host.${str}`);
  }
  if (isPresent(value.method)) {
    return printExprString(value.method).map((str) => `method.${str}`);
  }
  if (isPresent(value.path)) {
    return printExprString(value.path).map((str) => `path.${str}`);
  }
  if (isPresent(value.port)) {
    return printExprInt(value.port).map((str) => `port.${str}`);
  }
  if (isPresent(value.query)) {
    return printExprString(value.query).map((str) => `query.${str}`);
  }
  if (isPresent(value.raw)) {
    return printExprString(value.raw).map((str) => `raw.${str}`);
  }
  return err(new InvalidQuery());
};

const printClauseResponse = (
  value: FilterClauseResponse,
): Result<string, HTTPQLError> => {
  if (isPresent(value.raw)) {
    return printExprString(value.raw).map((str) => `raw.${str}`);
  }
  if (isPresent(value.statusCode)) {
    return printExprInt(value.statusCode).map((str) => `status.${str}`);
  }
  return err(new InvalidQuery());
};

const printExprPreset = (
  preset: FilterExprPreset,
  options: Options,
): Result<string, HTTPQLError> => {
  const match = options.presets?.find((p) => p.id === preset.id);

  if (isAbsent(match)) {
    return err(new MissingPreset(preset.id));
  }

  switch (preset.source) {
    case FilterExprPresetSource.Name:
      return ok(`preset:"${match.name}"`);
    case FilterExprPresetSource.Alias:
      return ok(`preset:${match.alias}`);
  }
};

const printExprInt = (value: FilterExprInt): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:${value.value}`);
};

const printExprString = (
  value: FilterExprString,
): Result<string, HTTPQLError> => {
  return ok(`${value.operator.toLowerCase()}:"${value.value}"`);
};
