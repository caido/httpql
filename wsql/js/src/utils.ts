import type { SyntaxNode } from "@lezer/common";

export const isAbsent = <T>(
  argument: T | undefined | null,
): argument is undefined | null => {
  return argument === undefined || argument === null;
};

export const isPresent = <T>(
  argument: T | undefined | null,
): argument is NonNullable<T> => {
  return argument !== undefined && argument !== null;
};

export const getString = (node: SyntaxNode, doc: string) => {
  return doc.slice(node.from, node.to);
};

export const getChildString = (node: SyntaxNode, type: number, doc: string) => {
  const child = node.getChild(type);
  if (isPresent(child)) {
    return doc.slice(child.from, child.to);
  }
};
