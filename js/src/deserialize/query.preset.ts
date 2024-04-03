import type { SyntaxNode } from "@lezer/common";
import { err, ok, type Result } from "neverthrow";

import { type HTTPQLError, InvalidQuery } from "../errors";
import { terms } from "../parser";
import type { FilterExprPreset, Options } from "../primitives";
import { FilterExprPresetSource } from "../primitives";
import { getChildString, isPresent } from "../utils";

export const deserializePresetQuery = (
  node: SyntaxNode,
  doc: string,
  options: Options,
): Result<FilterExprPreset, HTTPQLError> => {
  const presets = options.presets ?? [];
  const nameStr = getChildString(node, terms.PresetNameExpression, doc);

  if (isPresent(nameStr)) {
    try {
      const parsed = JSON.parse(nameStr);
      const preset = presets.find((p) => {
        return p.name.toLowerCase() === parsed.toLowerCase();
      });

      if (isPresent(preset)) {
        return ok({
          id: preset.id,
          source: FilterExprPresetSource.Name,
        });
      }
    } catch {
      return err(new InvalidQuery());
    }
  }

  const aliasStr = getChildString(node, terms.PresetAliasExpression, doc);
  if (isPresent(aliasStr)) {
    const preset = presets.find((p) => {
      return p.alias.toLowerCase() === aliasStr.toLowerCase();
    });

    if (isPresent(preset)) {
      return ok({
        id: preset.id,
        source: FilterExprPresetSource.Alias,
      });
    }
  }

  return err(new InvalidQuery());
};
