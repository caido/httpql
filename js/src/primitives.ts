export type Maybe<T> = T | undefined | null;

export type FilterClauseRequestInput = {
  fileExtension?: Maybe<FilterExprStringInput>;
  host?: Maybe<FilterExprStringInput>;
  method?: Maybe<FilterExprStringInput>;
  path?: Maybe<FilterExprStringInput>;
  port?: Maybe<FilterExprIntInput>;
  query?: Maybe<FilterExprStringInput>;
  raw?: Maybe<FilterExprStringInput>;
};

export type FilterClauseRequestResponseInput = {
  AND?: Maybe<Array<FilterClauseRequestResponseInput>>;
  OR?: Maybe<Array<FilterClauseRequestResponseInput>>;
  preset?: Maybe<FilterExprPresetInput>;
  request?: Maybe<FilterClauseRequestInput>;
  response?: Maybe<FilterClauseResponseInput>;
  source?: Maybe<FilterExprStringInput>;
};

export type FilterClauseResponseInput = {
  raw?: Maybe<FilterExprStringInput>;
  statusCode?: Maybe<FilterExprIntInput>;
};

export type FilterExprIntInput = {
  operator: FilterOperatorInt;
  value?: number;
};

export type FilterExprPresetInput = {
  id: string;
};

export type FilterExprStringInput = {
  operator: FilterOperatorString;
  value?: string;
};

export const FilterOperatorInt = {
  Eq: "EQ",
  Gt: "GT",
  Gte: "GTE",
  Lt: "LT",
  Lte: "LTE",
  Ne: "NE",
} as const;
export type FilterOperatorInt =
  (typeof FilterOperatorInt)[keyof typeof FilterOperatorInt];

export const FilterOperatorString = {
  Cont: "CONT",
  Eq: "EQ",
  Like: "LIKE",
  Ncont: "NCONT",
  Ne: "NE",
  Nlike: "NLIKE",
  Nregex: "NREGEX",
  Regex: "REGEX",
} as const;
export type FilterOperatorString =
  (typeof FilterOperatorString)[keyof typeof FilterOperatorString];

export type FilterPreset = {
  id: string;
  alias: string;
  name: string;
};
