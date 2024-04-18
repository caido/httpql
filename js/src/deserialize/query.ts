import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { HTTPQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import type { Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializeCombinedQuery } from "./query.combined.js";
import { deserializeGroupQuery } from "./query.group.js";
import { deserializeSingleQuery } from "./query.single.js";
import { deserializeStringQuery } from "./query.string.js";

export const deserializeQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const stringQuery = node.getChild(terms.StringQuery);
  if (isPresent(stringQuery)) {
    return deserializeStringQuery(stringQuery, doc);
  }

  const singleQuery = node.getChild(terms.SingleQuery);
  if (isPresent(singleQuery)) {
    return deserializeSingleQuery(singleQuery, doc);
  }

  const combinedQuery = node.getChild(terms.CombinedQuery);
  if (isPresent(combinedQuery)) {
    return deserializeCombinedQuery(combinedQuery, doc);
  }

  const groupQuery = node.getChild(terms.GroupQuery);
  if (isPresent(groupQuery)) {
    return deserializeGroupQuery(groupQuery, doc);
  }

  return ok({});
};
