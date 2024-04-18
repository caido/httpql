import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors.js";
import { terms } from "../parser/index.js";
import type { ExprPreset } from "../primitives.js";
import { getChildString, isPresent } from "../utils.js";

import { deserializeString } from "./string.js";

export const deserializePresetQuery = (
  node: SyntaxNode,
  doc: string,
): Result<ExprPreset, HTTPQLError> => {
  const nameNode = node.getChild(terms.PresetNameExpression);
  if (isPresent(nameNode)) {
    return deserializeString(nameNode, doc).map(({ value }) => {
      return {
        name: value,
      };
    });
  }

  const aliasStr = getChildString(node, terms.PresetAliasExpression, doc);
  if (isPresent(aliasStr)) {
    return ok({
      alias: aliasStr,
    });
  }

  return err(new InvalidQuery());
};
