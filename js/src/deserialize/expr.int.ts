import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { getChildString, isPresent } from "../utils";
import { type FilterExprIntInput, FilterOperatorInt } from "../primitives";

import { terms } from "../parser";
import { HTTPQLError, InvalidQuery } from "../errors";

export const deserializeIntExpr = (
  node: SyntaxNode,
  doc: string
): Result<FilterExprIntInput, HTTPQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.IntOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "gt":
          return FilterOperatorInt.Gt;
        case "gte":
          return FilterOperatorInt.Gte;
        case "lt":
          return FilterOperatorInt.Lt;
        case "lte":
          return FilterOperatorInt.Lte;
        case "ne":
          return FilterOperatorInt.Ne;
        case "eq":
          return FilterOperatorInt.Eq;
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
