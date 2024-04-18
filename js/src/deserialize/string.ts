import type { SyntaxNode } from "@lezer/common";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

type DeserializedString = {
  value: string;
  isRaw: boolean;
};

export const deserializeString = (
  node: SyntaxNode,
  doc: string,
): Result<DeserializedString, HTTPQLError> => {
  const value = getChildString(node, terms.StringValue, doc);
  if (isPresent(value)) {
    try {
      return ok({
        value: JSON.parse(value),
        isRaw: false,
      });
    } catch {
      return err(new InvalidQuery());
    }
  }

  const child = node.getChild(terms.RegexValue);
  if (isPresent(child)) {
    const value = getChildString(child, terms.RegexContent, doc);
    if (isAbsent(value)) {
      return err(new InvalidQuery());
    }

    return ok({
      value,
      isRaw: true,
    });
  }

  return err(new InvalidQuery());
};
