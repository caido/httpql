import type { BaseError } from "@caido/common-frontend";
import { isPresent } from "@caido/common-frontend";
import type { SyntaxNode } from "@lezer/common";
import type { Result } from "neverthrow";
import { err } from "neverthrow";

import { UserErrors } from "@/errors";
import { getChildString } from "@/languages/utils";
import type { FilterClauseRequestInput } from "@/types";

import { terms } from "../parser";

import { deserializeIntExpr } from "./expr.int";
import { deserializeStringExpr } from "./expr.string";

export const deserializeRequestQuery = (
  node: SyntaxNode,
  doc: string,
): Result<FilterClauseRequestInput, BaseError> => {
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

  return err(new UserErrors.InvalidHTTPQLQuery());
};
