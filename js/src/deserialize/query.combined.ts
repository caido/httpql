import type { SyntaxNode } from "@lezer/common";
import { err, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import type { Options, Query } from "../primitives";

import { deserializeQuery } from "./query";

export const deserializeCombinedQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<Query, HTTPQLError> => {
  const isAnd = !!node.getChild(terms.And);
  const isOr = !!node.getChild(terms.Or);

  if (!isAnd && !isOr) {
    return err(new InvalidQuery());
  }

  const results = node
    .getChildren(terms.Query)
    .map((n) => deserializeQuery(n, doc, options));

  const combined = Result.combine(results);

  return combined.map((clauses) => {
    if (isAnd) {
      return {
        AND: clauses,
      };
    }
    if (isOr) {
      return {
        OR: clauses,
      };
    }
    return {};
  });
};
