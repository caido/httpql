import type { SyntaxNode } from "@lezer/common";
import { err, Result } from "neverthrow";

import { getChildString, isAbsent } from "../utils";
import type { FilterClauseRequestResponse, Options } from "../primitives";
import { terms } from "../parser";
import { type HTTPQLError, InvalidQuery } from "../errors";

import { deserializeQuery } from "./query";

export const deserializeCombinedQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options
): Result<FilterClauseRequestResponse, HTTPQLError> => {
  const operator = getChildString(
    node,
    terms.LogicalOperator,
    doc
  )?.toUpperCase();

  if (isAbsent(operator) || (operator !== "AND" && operator !== "OR")) {
    return err(new InvalidQuery());
  }

  const results = node
    .getChildren(terms.Query)
    .map((n) => deserializeQuery(n, doc, options));

  const combined = Result.combine(results);

  return combined.map((clauses) => {
    switch (operator) {
      case "AND":
        return {
          AND: clauses,
        };

      case "OR":
        return {
          OR: clauses,
        };
    }
  });
};
