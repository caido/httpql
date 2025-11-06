import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { parser, terms } from "../parser/index.js";
import type { Query } from "../primitives.js";
import { isAbsent } from "../utils.js";

import { deserializeQuery } from "./query.js";

export const deserialize = (doc: string): Result<Query, HTTPQLError> => {
  const trimmed = doc.trim();
  if (trimmed === "") {
    return ok({});
  }

  const tree = parser.parse(doc);

  let hasError = false;
  tree.iterate({
    enter: (node) => {
      if (node.type.isError) {
        console.error(node.from, node.to);
        hasError = true;
      }
    },
  });

  const query = tree.topNode.getChild(terms.Query);
  if (hasError || isAbsent(query)) {
    return err(new InvalidQuery());
  }

  return deserializeQuery(query, doc);
};
