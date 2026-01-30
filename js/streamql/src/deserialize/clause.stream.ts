import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { InvalidQuery, type StreamQLError } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseStream } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeBoolExpr } from "./expr.bool.js";
import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";

export const deserializeStreamClause = (
  node: SyntaxNode,
  doc: string,
): Result<ClauseStream, StreamQLError> => {
  const stringField = (() => {
    const child = getChildString(node, terms.StreamStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "host":
          return "host";
        case "path":
          return "path";
        case "source":
          return "source";
        case "protocol":
          return "protocol";
      }
    }
  })();

  const intField = (() => {
    const child = getChildString(node, terms.StreamIntFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "port":
          return "port";
      }
    }
  })();

  const boolField = (() => {
    const child = getChildString(node, terms.StreamBoolFieldName, doc);

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

  if (isPresent(boolField) && isPresent(boolFilter)) {
    return boolFilter.map((filter) => {
      return {
        [boolField]: filter,
      };
    });
  }

  return err(new InvalidQuery());
};
