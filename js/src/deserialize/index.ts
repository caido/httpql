import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { FilterClauseRequestResponseInput } from "../primitives";
import { HTTPQLError, InvalidQuery } from "../errors";
import { parser, terms } from "../parser";
import { isAbsent } from "../utils";

import { deserializeQuery } from "./query";
import type { Options } from "./types";

export const deserialize = (
  doc: string,
  options: Options = {
    presets: undefined,
  }
): Result<FilterClauseRequestResponseInput, HTTPQLError> => {
  const trimmed = doc.trim();
  if (trimmed === "") {
    return ok({});
  }

  const tree = parser.parse(doc);

  let hasError = false;
  tree.iterate({
    enter: (node) => {
      if (node.type.isError) {
        hasError = true;
      }

      if (node.type.is(terms.PresetQuery) && isAbsent(options.presets)) {
        hasError = true;
      }
    },
  });

  const query = tree.topNode.getChild(terms.Query);
  if (hasError || isAbsent(query)) {
    return err(new InvalidQuery());
  }

  return deserializeQuery(query, doc, options);
};
