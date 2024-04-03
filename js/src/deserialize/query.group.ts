import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { FilterClauseRequestResponse, Options } from "../primitives";
import { isPresent } from "../utils";
import { HTTPQLError } from "../errors";

import { terms } from "../parser";

import { deserializeQuery } from "./query";

export const deserializeGroupQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options
): Result<FilterClauseRequestResponse, HTTPQLError> => {
  const query = node.getChild(terms.Query);

  if (isPresent(query)) {
    return deserializeQuery(query, doc, options).map((query) => {
      return {
        AND: [query],
      };
    });
  }

  return ok({});
};
