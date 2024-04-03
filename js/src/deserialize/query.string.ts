import type { SyntaxNode } from "@lezer/common";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { OperatorString, type Query } from "../primitives";

export const deserializeStringQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  try {
    const value = JSON.parse(doc.slice(node.from, node.to));
    const clause = {
      OR: [
        {
          request: {
            raw: {
              operator: OperatorString.Cont,
              value,
            },
          },
        },
        {
          response: {
            raw: {
              operator: OperatorString.Cont,
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
