import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ExprSource } from "../primitives.js";
import { isPresent } from "../utils.js";

import { deserializeString } from "./string.js";

export const deserializeSourceQuery = (
  node: SyntaxNode,
  doc: string,
): Result<ExprSource, HTTPQLError> => {
  const nameNode = node.getChild(terms.SourceNameExpression);
  if (isPresent(nameNode)) {
    return deserializeString(nameNode, doc).map(({ value }) => {
      return {
        name: value,
      };
    });
  }

  return err(new InvalidQuery());
};
