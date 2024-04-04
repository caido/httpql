import type { SyntaxNode } from "@lezer/common";
import type { Result } from "neverthrow";

import { type HTTPQLError } from "../errors";
import { OperatorString, type Query } from "../primitives";

import { deserializeString } from "./string";

export const deserializeStringQuery = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  return deserializeString(node, doc).map((value) => {
    return {
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
  });
};
