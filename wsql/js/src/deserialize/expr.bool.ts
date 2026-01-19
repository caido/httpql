import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type WSQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { type ExprBool, OperatorBool } from "../primitives.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

export const deserializeBoolExpr = (
  node: SyntaxNode,
  doc: string,
): Result<ExprBool, WSQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.BoolOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "eq":
          return OperatorBool.Eq;
        case "ne":
          return OperatorBool.Ne;
      }
    }
  })();
  if (isAbsent(operator)) {
    return err(new InvalidQuery());
  }

  const value = (() => {
    const valueStr = getChildString(node, terms.BoolValue, doc);

    if (isPresent(valueStr)) {
      switch (valueStr) {
        case "true":
          return true;
        case "false":
          return false;
      }
    }
  })();
  if (isAbsent(value)) {
    return err(new InvalidQuery());
  }

  return ok({
    operator,
    value,
  });
};
