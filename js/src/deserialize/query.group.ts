import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { HTTPQLError } from "../errors";
import { terms } from "../parser";
import type { Options, Query } from "../primitives";
import { isPresent } from "../utils";

import { deserializeQuery } from "./query";

export const deserializeGroupQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<Query, HTTPQLError> => {
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
