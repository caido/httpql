import type { SyntaxNode } from "@lezer/common";
import type { Result } from "neverthrow";

import { type HTTPQLError } from "../errors.js";
import { OperatorString, type Query } from "../primitives.js";

import { deserializeString } from "./string.js";

export const deserializeStringClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  return deserializeString(node, doc).map(({ value }) => {
    return {
      OR: [
        {
          request: {
            raw: {
              operator: OperatorString.Cont,
              value,
              isRaw: false,
            },
          },
        },
        {
          response: {
            raw: {
              operator: OperatorString.Cont,
              value,
              isRaw: false,
            },
          },
        },
      ],
    };
  });
};
