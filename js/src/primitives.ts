export type Maybe<T> = T | undefined | null;

export type Query = {
  AND?: Maybe<Array<Query>>;
  OR?: Maybe<Array<Query>>;
  preset?: Maybe<ExprPreset>;
  request?: Maybe<ClauseRequest>;
  response?: Maybe<ClauseResponse>;
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
};

export type ExprInt = {
  operator: OperatorInt;
  value: number;
};

export type ExprPreset = {
  id: string;
  source: ExprPresetSource;
};

export const ExprPresetSource = {
  Name: "NAME",
  Alias: "ALIAS",
} as const;
export type ExprPresetSource =
  (typeof ExprPresetSource)[keyof typeof ExprPresetSource];

export type ExprString = {
  operator: OperatorString;
  value: string;
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

export type Preset = {
  id: string;
  alias: string;
  name: string;
};

export type Options = {
  presets: Maybe<Preset[]>;
};
