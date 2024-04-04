import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseRequest } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";

export const deserializeRequestQuery = (
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
        case "port":
          return "port";
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
