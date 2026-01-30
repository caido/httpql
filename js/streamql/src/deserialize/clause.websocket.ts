import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { InvalidQuery, type StreamQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseWs } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeDateExpr } from "./expr.date.js";
import { deserializeStringExpr } from "./expr.string.js";

export const deserializeWsClause = (
  node: SyntaxNode,
  doc: string,
): Result<ClauseWs, StreamQLError> => {
  const stringField = (() => {
    const child = getChildString(node, terms.WsStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "direction":
          return "direction";
        case "raw":
          return "raw";
        case "format":
          return "format";
      }
    }
  })();

  const dateField = (() => {
    const child = getChildString(node, terms.WsDateFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "created_at":
          return "createdAt";
      }
    }
  })();

  const stringFilter = (() => {
    const child = node.getChild(terms.StringExpression);
    if (isPresent(child)) return deserializeStringExpr(child, doc);
  })();

  const dateFilter = (() => {
    const child = node.getChild(terms.DateExpression);
    if (isPresent(child)) return deserializeDateExpr(child, doc);
  })();

  if (isPresent(stringField) && isPresent(stringFilter)) {
    return stringFilter.map((filter) => {
      return {
        [stringField]: filter,
      };
    });
  }

  if (isPresent(dateField) && isPresent(dateFilter)) {
    return dateFilter.map((filter) => {
      return {
        [dateField]: filter,
      };
    });
  }

  return err(new InvalidQuery());
};
