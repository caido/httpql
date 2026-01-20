import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { type ExprInt, OperatorInt } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

export const deserializeIntExpr = (
  node: SyntaxNode,
  doc: string,
): Result<ExprInt, HTTPQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.IntOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "gt":
          return OperatorInt.Gt;
        case "gte":
          return OperatorInt.Gte;
        case "lt":
          return OperatorInt.Lt;
        case "lte":
          return OperatorInt.Lte;
        case "ne":
          return OperatorInt.Ne;
        case "eq":
          return OperatorInt.Eq;
      }
    }
  })();

  const value = (() => {
    const child = getChildString(node, terms.IntValue, doc);

    if (isPresent(child)) {
      const parsed = parseInt(child);
      return isNaN(parsed) ? undefined : parsed;
    }
  })();

  if (isPresent(operator) && isPresent(value)) {
    return ok({
      operator,
      value,
    });
  }

  return err(new InvalidQuery());
};
