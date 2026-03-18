import type { SyntaxNode } from "@lezer/common";
import { err, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { OperatorString, type Query } from "../primitives.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";
import { deserializeString } from "./string.js";

export const deserializeResponseClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const headerShortExpr = (() => {
    const valueExprNode = node.getChild(terms.StringExpression);
    if (isAbsent(valueExprNode)) return;

    const headerNameResult = deserializeString(node, doc);
    if (headerNameResult.isErr()) {
      return;
    }

    const { value: headerName, isRaw } = headerNameResult.value;
    if (isRaw) {
      return;
    }

    return deserializeStringExpr(valueExprNode, doc).map((valueExpr) => {
      return {
        AND: [
          {
            response: {
              header: {
                name: {
                  operator: OperatorString.Eq,
                  value: headerName,
                  isRaw: false,
                },
              },
            },
          },
          {
            response: {
              header: {
                value: valueExpr,
              },
            },
          },
        ],
      } satisfies Query;
    });
  })();
  if (isPresent(headerShortExpr)) {
    return headerShortExpr;
  }

  const stringField = (() => {
    const child = getChildString(node, terms.ResponseStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "body":
          return "body";
        case "raw":
          return "raw";
      }
    }
  })();
  const headerSubfield = (() => {
    const child = getChildString(node, terms.ResponseHeaderSubfieldName, doc);
    if (isPresent(child)) {
      switch (child) {
        case "name":
          return "name";
        case "value":
          return "value";
      }
    }
  })();

  const intField = (() => {
    const child = getChildString(node, terms.ResponseIntFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "code":
          return "statusCode";
        case "len":
          return "length";
        case "roundtrip":
          return "roundtripTime";
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
        response: {
          [stringField]: filter,
        },
      };
    });
  }

  if (isPresent(intField) && isPresent(intFilter)) {
    return intFilter.map((filter) => {
      return {
        response: {
          [intField]: filter,
        },
      };
    });
  }

  if (isPresent(headerSubfield) && isPresent(stringFilter)) {
    return stringFilter.map((filter) => {
      return {
        response: {
          header: {
            [headerSubfield]: filter,
          },
        },
      };
    });
  }

  return err(new InvalidQuery());
};
