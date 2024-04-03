import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import { terms } from "../parser";
import type { FilterClauseRequestResponseInput, Options } from "../primitives";
import { isPresent } from "../utils";
import { HTTPQLError } from "../errors";

import { deserializeCombinedQuery } from "./query.combined";
import { deserializeGroupQuery } from "./query.group";
import { deserializeSingleQuery } from "./query.single";
import { deserializeStringQuery } from "./query.string";

export const deserializeQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options
): Result<FilterClauseRequestResponseInput, HTTPQLError> => {
  const stringQuery = node.getChild(terms.StringQuery);
  if (isPresent(stringQuery)) {
    return deserializeStringQuery(stringQuery, doc);
  }

  const singleQuery = node.getChild(terms.SingleQuery);
  if (isPresent(singleQuery)) {
    return deserializeSingleQuery(singleQuery, doc, options);
  }

  const combinedQuery = node.getChild(terms.CombinedQuery);
  if (isPresent(combinedQuery)) {
    return deserializeCombinedQuery(combinedQuery, doc, options);
  }

  const groupQuery = node.getChild(terms.GroupQuery);
  if (isPresent(groupQuery)) {
    return deserializeGroupQuery(groupQuery, doc, options);
  }

  return ok({});
};
