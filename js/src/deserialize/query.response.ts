import type { BaseError } from "@caido/common-frontend";
import { isPresent } from "@caido/common-frontend";
import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { UserErrors } from "@/errors";
import { getChildString } from "@/languages/utils";
import type { FilterClauseResponseInput } from "@/types";

import { terms } from "../parser";

import { deserializeIntExpr } from "./expr.int";
import { deserializeStringExpr } from "./expr.string";

export const deserializeResponseQuery = (
  node: SyntaxNode,
  doc: string,
): Result<FilterClauseResponseInput, BaseError> => {
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

  return err(new UserErrors.InvalidHTTPQLQuery());
};
