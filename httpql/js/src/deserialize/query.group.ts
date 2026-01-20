import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { HTTPQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import type { Query } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializeQuery } from "./query.js";

export const deserializeGroupQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const query = node.getChild(terms.Query);

  if (isPresent(query)) {
    return deserializeQuery(query, doc);
  }

  return ok({});
};
