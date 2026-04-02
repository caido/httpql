import type { SyntaxNode } from "@lezer/common";
import { err } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import { OperatorString, type Query } from "../primitives.js";
import { getChildString, isAbsent, isPresent } from "../utils.js";

import { deserializeBoolExpr } from "./expr.bool.js";
import { deserializeDateExpr } from "./expr.date.js";
import { deserializeIntExpr } from "./expr.int.js";
import { deserializeStringExpr } from "./expr.string.js";
import { deserializeString } from "./string.js";

export const deserializeRequestClause = (
  node: SyntaxNode,
  doc: string,
): Result<Query, HTTPQLError> => {
  const headerShortExpr = (() => {
    const headerNameResult = deserializeString(node, doc);
    if (headerNameResult.isErr()) {
      return;
    }

    const { value: headerName, isRaw } = headerNameResult.value;
    if (isRaw) {
      return;
    }

    const valueExprNode = node.getChild(terms.StringExpression);
    if (isAbsent(valueExprNode)) return;

    return deserializeStringExpr(valueExprNode, doc).map((valueExpr) => {
      return {
        request: {
          header: {
            name: {
              operator: OperatorString.Eq,
              value: headerName,
              isRaw: false,
            },
            value: valueExpr,
          },
        },
      } satisfies Query;
    });
  })();
  if (isPresent(headerShortExpr)) {
    return headerShortExpr;
  }

  const stringField = (() => {
    const child = getChildString(node, terms.RequestStringFieldName, doc);

    if (isPresent(child)) {
      switch (child) {
        case "body":
          return "body";
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
  const headerSubfield = (() => {
    const child = getChildString(node, terms.RequestHeaderSubfieldName, doc);
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
        request: {
          [stringField]: filter,
        },
      };
    });
  }

  if (isPresent(intField) && isPresent(intFilter)) {
    return intFilter.map((filter) => {
      return {
        request: {
          [intField]: filter,
        },
      };
    });
  }

  if (isPresent(dateField) && isPresent(dateFilter)) {
    return dateFilter.map((filter) => {
      return {
        request: {
          [dateField]: filter,
        },
      };
    });
  }

  if (isPresent(boolField) && isPresent(boolFilter)) {
    return boolFilter.map((filter) => {
      return {
        request: {
          [boolField]: filter,
        },
      };
    });
  }

  if (isPresent(headerSubfield) && isPresent(stringFilter)) {
    return stringFilter.map((filter) => {
      return {
        request: {
          header: {
            [headerSubfield]: filter,
          },
        },
      };
    });
  }

  return err(new InvalidQuery());
};
