import type { SyntaxNode } from "@lezer/common";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import {
  type FilterClauseRequestResponseInput,
  FilterOperatorString,
} from "../primitives";
import { type HTTPQLError, InvalidQuery } from "../errors";

export const deserializeStringQuery = (
  node: SyntaxNode,
  doc: string
): Result<FilterClauseRequestResponseInput, HTTPQLError> => {
  try {
    const value = JSON.parse(doc.slice(node.from, node.to));
    const clause = {
      OR: [
        {
          request: {
            raw: {
              operator: FilterOperatorString.Cont,
              value,
            },
          },
        },
        {
          response: {
            raw: {
              operator: FilterOperatorString.Cont,
              value,
            },
          },
        },
      ],
    };

    return ok(clause);
  } catch {
    return err(new InvalidQuery());
  }
};
