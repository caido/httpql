import type { SyntaxNode } from "@lezer/common";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import { type ExprString, OperatorString } from "../primitives";
import { getChildString, isPresent } from "../utils";

export const deserializeStringExpr = (
  node: SyntaxNode,
  doc: string,
): Result<ExprString, HTTPQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.StringOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "cont":
          return OperatorString.Cont;
        case "ncont":
          return OperatorString.Ncont;
        case "ne":
          return OperatorString.Ne;
        case "eq":
          return OperatorString.Eq;
        case "like":
          return OperatorString.Like;
        case "nlike":
          return OperatorString.Nlike;
        case "regex":
          return OperatorString.Regex;
        case "nregex":
          return OperatorString.Nregex;
      }
    }
  })();

  const value = getChildString(node, terms.StringValue, doc);

  if (isPresent(operator) && isPresent(value)) {
    try {
      return ok({
        operator,
        value: JSON.parse(value),
      });
    } catch {
      return err(new InvalidQuery());
    }
  }

  return err(new InvalidQuery());
};
