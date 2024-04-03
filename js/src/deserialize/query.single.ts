import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import type { FilterClauseRequestResponseInput, Options } from "../primitives";
import { terms } from "../parser";
import { isPresent } from "../utils";
import { type HTTPQLError, InvalidQuery } from "../errors";

import { deserializePresetQuery } from "./query.preset";
import { deserializeRequestQuery } from "./query.request";
import { deserializeResponseQuery } from "./query.response";

export const deserializeSingleQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options
): Result<FilterClauseRequestResponseInput, HTTPQLError> => {
  const requestQuery = node.getChild(terms.RequestQuery);
  if (isPresent(requestQuery)) {
    return deserializeRequestQuery(requestQuery, doc).map((request) => {
      return {
        request,
      };
    });
  }

  const responseQuery = node.getChild(terms.ResponseQuery);
  if (isPresent(responseQuery)) {
    return deserializeResponseQuery(responseQuery, doc).map((response) => {
      return {
        response,
      };
    });
  }

  const presetQuery = node.getChild(terms.PresetQuery);
  if (isPresent(presetQuery)) {
    return deserializePresetQuery(presetQuery, doc, options).map((preset) => {
      return {
        preset,
      };
    });
  }

  return err(new InvalidQuery());
};
