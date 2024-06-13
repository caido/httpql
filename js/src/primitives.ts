export type Maybe<T> = T | undefined | null;

export type Query = {
  AND?: Maybe<[Query, Query]>;
  OR?: Maybe<[Query, Query]>;
  row?: Maybe<ClauseRow>;
  preset?: Maybe<ExprPreset>;
  request?: Maybe<ClauseRequest>;
  response?: Maybe<ClauseResponse>;
};

export type ClauseRow = {
  id?: Maybe<ExprInt>;
};

export type ClauseRequest = {
  fileExtension?: Maybe<ExprString>;
  host?: Maybe<ExprString>;
  method?: Maybe<ExprString>;
  path?: Maybe<ExprString>;
  port?: Maybe<ExprInt>;
  query?: Maybe<ExprString>;
  raw?: Maybe<ExprString>;
};

export type ClauseResponse = {
  raw?: Maybe<ExprString>;
  statusCode?: Maybe<ExprInt>;
  roundtripTime?: Maybe<ExprInt>;
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
