import type { SyntaxNode } from "@lezer/common";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { getChildString, isAbsent } from "../utils.js";

export const deserializeString = (
  node: SyntaxNode,
  doc: string,
): Result<string, HTTPQLError> => {
  const child = node.getChild(terms.StringValue);
  if (isAbsent(child)) {
    return err(new InvalidQuery());
  }

  const value = getChildString(child, terms.StringContent, doc);
  if (isAbsent(value)) {
    return err(new InvalidQuery());
  }

  return ok(value);
};
