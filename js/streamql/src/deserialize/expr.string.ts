import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { InvalidQuery, type StreamQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import { type ExprString, OperatorString } from "../primitives.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

import { deserializeString } from "./string.js";

export const deserializeStringExpr = (
  node: SyntaxNode,
  doc: string,
): Result<ExprString, StreamQLError> => {
  const operator = (() => {
    const stringOperatorStr = getChildString(node, terms.StringOperator, doc);
    if (isPresent(stringOperatorStr)) {
      switch (stringOperatorStr) {
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
      }
    }

    const regexOperatorStr = getChildString(node, terms.RegexOperator, doc);
    if (isPresent(regexOperatorStr)) {
      switch (regexOperatorStr) {
        case "regex":
          return OperatorString.Regex;
        case "nregex":
          return OperatorString.Nregex;
      }
    }
  })();
  if (isAbsent(operator)) {
    return err(new InvalidQuery());
  }

  return deserializeString(node, doc).map(({ value, isRaw }) => {
    return {
      operator,
      value,
      isRaw,
    };
  });
};
