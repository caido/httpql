import type { SyntaxNode } from "@lezer/common";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import { type FilterExprString, FilterOperatorString } from "../primitives";
import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import { isPresent, getChildString } from "../utils";

export const deserializeStringExpr = (
  node: SyntaxNode,
  doc: string
): Result<FilterExprString, HTTPQLError> => {
  const operator = (() => {
    const operatorStr = getChildString(node, terms.StringOperator, doc);

    if (isPresent(operatorStr)) {
      switch (operatorStr) {
        case "cont":
          return FilterOperatorString.Cont;
        case "ncont":
          return FilterOperatorString.Ncont;
        case "ne":
          return FilterOperatorString.Ne;
        case "eq":
          return FilterOperatorString.Eq;
        case "like":
          return FilterOperatorString.Like;
        case "nlike":
          return FilterOperatorString.Nlike;
        case "regex":
          return FilterOperatorString.Regex;
        case "nregex":
          return FilterOperatorString.Nregex;
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
