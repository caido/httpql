import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { HTTPQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import type { Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializeClause } from "./clause.js";
import { deserializeGroupQuery } from "./query.group.js";
import { deserializeLogicalQuery } from "./query.logical.js";

export const deserializeQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const clause = node.getChild(terms.Clause);
  if (isPresent(clause)) {
    return deserializeClause(clause, doc);
  }

  const logicalQuery = node.getChild(terms.LogicalQuery);
  if (isPresent(logicalQuery)) {
    return deserializeLogicalQuery(logicalQuery, doc);
  }

  const groupQuery = node.getChild(terms.GroupQuery);
  if (isPresent(groupQuery)) {
    return deserializeGroupQuery(groupQuery, doc);
  }

  return ok({});
};
