import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseRequest } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeBoolExpr } from "./expr.bool.js";
import { deserializeDateExpr } from "./expr.date.js";
import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";

export const deserializeRequestClause = (
  node: SyntaxNode,
  doc: string,
): Result<ClauseRequest, HTTPQLError> => {
  const stringField = (() => {
    const child = getChildString(node, terms.RequestStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "ext":
          return "fileExtension";
        case "host":
          return "host";
        case "method":
          return "method";
        case "path":
          return "path";
        case "query":
          return "query";
        case "raw":
          return "raw";
      }
    }
  })();

  const intField = (() => {
    const child = getChildString(node, terms.RequestIntFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "len":
          return "length";
        case "port":
          return "port";
      }
    }
  })();

  const dateField = (() => {
    const child = getChildString(node, terms.RequestDateFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "created_at":
          return "createdAt";
      }
    }
  })();

  const boolField = (() => {
    const child = getChildString(node, terms.RequestBoolFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "tls":
          return "isTLS";
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

  const dateFilter = (() => {
    const child = node.getChild(terms.DateExpression);
    if (isPresent(child)) return deserializeDateExpr(child, doc);
  })();

  const boolFilter = (() => {
    const child = node.getChild(terms.BoolExpression);
    if (isPresent(child)) return deserializeBoolExpr(child, doc);
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

  if (isPresent(dateField) && isPresent(dateFilter)) {
    return dateFilter.map((filter) => {
      return {
        [dateField]: filter,
      };
    });
  }

  if (isPresent(boolField) && isPresent(boolFilter)) {
    return boolFilter.map((filter) => {
      return {
        [boolField]: filter,
      };
    });
  }

  return err(new InvalidQuery());
};
