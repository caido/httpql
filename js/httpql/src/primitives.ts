// eslint-disable-next-line @typescript-eslint/no-restricted-types
export type Maybe<T> = T | undefined | null;

export type Query = {
  AND?: Maybe<[Query, Query]>;
  OR?: Maybe<[Query, Query]>;
  row?: Maybe<ClauseRow>;
  source?: Maybe<ExprSource>;
  preset?: Maybe<ExprPreset>;
  request?: Maybe<ClauseRequest>;
  response?: Maybe<ClauseResponse>;
};

export type ClauseRow = {
  id?: Maybe<ExprInt>;
};

export type ClauseRequest = {
  createdAt?: Maybe<ExprDate>;
  fileExtension?: Maybe<ExprString>;
  host?: Maybe<ExprString>;
  isTLS?: Maybe<ExprBool>;
  length?: Maybe<ExprInt>;
  method?: Maybe<ExprString>;
  path?: Maybe<ExprString>;
  port?: Maybe<ExprInt>;
  query?: Maybe<ExprString>;
  raw?: Maybe<ExprString>;
};

export type ClauseResponse = {
  length?: Maybe<ExprInt>;
  raw?: Maybe<ExprString>;
  roundtripTime?: Maybe<ExprInt>;
  statusCode?: Maybe<ExprInt>;
};

export type ExprInt = {
  operator: OperatorInt;
  value: number;
};

export type ExprPreset = { alias: string } | { name: string };

export type ExprSource = { name: string };

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
