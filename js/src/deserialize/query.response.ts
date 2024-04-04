import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseResponse } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";

export const deserializeResponseQuery = (
  node: SyntaxNode,
  doc: string,
): Result<ClauseResponse, HTTPQLError> => {
  const stringField = (() => {
    const child = getChildString(node, terms.ResponseStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "raw":
          return "raw";
      }
    }
  })();

  const intField = (() => {
    const child = getChildString(node, terms.ResponseIntFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "code":
          return "statusCode";
      }
    }
  })();

  const stringFilter = (() => {
    const child = node.getChild(terms.StringExpression);
    if (isPresent(child)) return deserializeStringExpr(child, doc);
  })();

  const intFilter = (() => {
    const child = node.getChild(terms.IntExpression);
    if (isPresent(child)) return deserializeIntExpr(child, doc);
  })();

  if (isPresent(stringField) && isPresent(stringFilter)) {
    return stringFilter.map((filter) => {
      return {
        [stringField]: filter,
      };
    });
  }

  if (isPresent(intField) && isPresent(intFilter)) {
    return intFilter.map((filter) => {
      return {
        [intField]: filter,
      };
    });
  }

  return err(new InvalidQuery());
};
