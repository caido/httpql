import { styleTags, tags } from "@lezer/highlight";

export const highlight = styleTags({
  "IntExpression/IntOperator": tags.operator,
  "IntExpression/IntValue": tags.integer,
  "StringExpression/StringOperator": tags.operator,
  RequestIntFieldName: tags.attributeName,
  RequestNamespace: tags.attributeName,
  RequestStringFieldName: tags.attributeName,
  ResponseIntFieldName: tags.attributeName,
  ResponseNamespace: tags.attributeName,
  PresetNamespace: tags.attributeName,
  SymbolValue: tags.literal,
  ResponseStringFieldName: tags.attributeName,
  "StringValue/...": tags.string,
});
