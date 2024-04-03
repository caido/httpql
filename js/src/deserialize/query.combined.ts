import type { SyntaxNode } from "@lezer/common";
import { err, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import type { Options, Query } from "../primitives";
import { getChildString, isAbsent } from "../utils";

import { deserializeQuery } from "./query";

export const deserializeCombinedQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<Query, HTTPQLError> => {
  const operator = getChildString(
    node,
    terms.LogicalOperator,
    doc,
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
