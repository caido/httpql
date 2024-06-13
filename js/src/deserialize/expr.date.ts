import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { type ExprDate, OperatorDate } from "../primitives.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

import { deserializeString } from "./string.js";

export const deserializeDateExpr = (
  node: SyntaxNode,
  doc: string,
): Result<ExprDate, HTTPQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.DateOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "gt":
          return OperatorDate.Gt;
        case "lt":
          return OperatorDate.Lt;
      }
    }
  })();
  if (isAbsent(operator)) {
    return err(new InvalidQuery());
  }

  return deserializeString(node, doc).andThen(({ value, isRaw }) => {
    if (isRaw) {
      return err(new InvalidQuery());
    }
    return ok({
      operator,
      value,
    });
  });
};
