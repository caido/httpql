import type { BaseError } from "@caido/common-frontend";
import { isPresent } from "@caido/common-frontend";
import type { SyntaxNode } from "@lezer/common";
import { ok, type Result } from "neverthrow";

import type { FilterClauseRequestResponseInput } from "@/types";

import { terms } from "../parser";

import { deserializeQuery } from "./query";
import type { Options } from "./types";

export const deserializeGroupQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<FilterClauseRequestResponseInput, BaseError> => {
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
