import type { SyntaxNode } from "@lezer/common";
import { err, ok, Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { Query } from "../primitives.js";

import { deserializeQuery } from "./query.js";

export const deserializeLogicalQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const isAnd = !!node.getChild(terms.And);
  const isOr = !!node.getChild(terms.Or);

  if (!isAnd && !isOr) {
    return err(new InvalidQuery());
  }

  const results = node
    .getChildren(terms.Query)
    .map((n) => deserializeQuery(n, doc));

  const combined = Result.combine(results);

  return combined.andThen((clauses) => {
    if (clauses.length !== 2) {
      return err(new InvalidQuery());
    }

    if (isAnd) {
      return ok({
        AND: clauses as [Query, Query],
      });
    }
    if (isOr) {
      return ok({
        OR: clauses as [Query, Query],
      });
    }

    return err(new InvalidQuery());
  });
};
