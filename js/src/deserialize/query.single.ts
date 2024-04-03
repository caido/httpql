import type { BaseError } from "@caido/common-frontend";
import { isPresent } from "@caido/common-frontend";
import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { UserErrors } from "@/errors";
import type { FilterClauseRequestResponseInput } from "@/types";

import { terms } from "../parser";

import { deserializePresetQuery } from "./query.preset";
import { deserializeRequestQuery } from "./query.request";
import { deserializeResponseQuery } from "./query.response";
import type { Options } from "./types";

export const deserializeSingleQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<FilterClauseRequestResponseInput, BaseError> => {
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

  return err(new UserErrors.InvalidHTTPQLQuery());
};
