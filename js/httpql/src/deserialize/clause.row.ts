import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ClauseRow } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeIntExpr } from "./expr.int.js";

export const deserializeRowClause = (
  node: SyntaxNode,
  doc: string,
): Result<ClauseRow, HTTPQLError> => {
  const intField = (() => {
    const child = getChildString(node, terms.RowIntFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "id":
          return "id";
      }
    }
  })();

  const intFilter = (() => {
    const child = node.getChild(terms.IntExpression);
    if (isPresent(child)) return deserializeIntExpr(child, doc);
  })();

  if (isPresent(intField) && isPresent(intFilter)) {
    return intFilter.map((filter) => {
      return {
        [intField]: filter,
      };
    });
  }

  return err(new InvalidQuery());
};
