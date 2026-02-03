export type Maybe<T> = T | undefined | null;

export type Query = {
  AND?: Maybe<[Query, Query]>;
  OR?: Maybe<[Query, Query]>;
  preset?: Maybe<ExprPreset>;
  websocket?: Maybe<ClauseWs>;
  stream?: Maybe<ClauseStream>;
};

export type ClauseWs = {
  createdAt?: Maybe<ExprDate>;
  raw?: Maybe<ExprString>;
  direction?: Maybe<ExprString>;
  format?: Maybe<ExprString>;
};

export type ClauseStream = {
  host?: Maybe<ExprString>;
  path?: Maybe<ExprString>;
  source?: Maybe<ExprString>;
  protocol?: Maybe<ExprString>;
  isTLS?: Maybe<ExprBool>;
  port?: Maybe<ExprInt>;
};

export type ExprInt = {
  operator: OperatorInt;
  value: number;
};

export type ExprPreset = { alias: string } | { name: string };

export type ExprString = {
  operator: OperatorString;
  value: string;
  isRaw: boolean;
};

export type ExprDate = {
  operator: OperatorDate;
  value: string;
};

export type ExprBool = {
  operator: OperatorBool;
  value: boolean;
};

export const OperatorInt = {
  Eq: "EQ",
  Gt: "GT",
  Gte: "GTE",
  Lt: "LT",
  Lte: "LTE",
  Ne: "NE",
} as const;
export type OperatorInt = (typeof OperatorInt)[keyof typeof OperatorInt];

export const OperatorString = {
  Cont: "CONT",
  Eq: "EQ",
  Like: "LIKE",
  Ncont: "NCONT",
  Ne: "NE",
  Nlike: "NLIKE",
  Nregex: "NREGEX",
  Regex: "REGEX",
} as const;
export type OperatorString =
  (typeof OperatorString)[keyof typeof OperatorString];

export const OperatorDate = {
  Gt: "GT",
  Lt: "LT",
} as const;
export type OperatorDate = (typeof OperatorDate)[keyof typeof OperatorDate];

export const OperatorBool = {
  Eq: "EQ",
  Ne: "NE",
} as const;
export type OperatorBool = (typeof OperatorBool)[keyof typeof OperatorBool];
