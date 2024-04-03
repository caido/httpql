export type Maybe<T> = T | undefined | null;

export type FilterClauseRequest = {
  fileExtension?: Maybe<FilterExprString>;
  host?: Maybe<FilterExprString>;
  method?: Maybe<FilterExprString>;
  path?: Maybe<FilterExprString>;
  port?: Maybe<FilterExprInt>;
  query?: Maybe<FilterExprString>;
  raw?: Maybe<FilterExprString>;
};

export type FilterClauseRequestResponse = {
  AND?: Maybe<Array<FilterClauseRequestResponse>>;
  OR?: Maybe<Array<FilterClauseRequestResponse>>;
  preset?: Maybe<FilterExprPreset>;
  request?: Maybe<FilterClauseRequest>;
  response?: Maybe<FilterClauseResponse>;
};

export type FilterClauseResponse = {
  raw?: Maybe<FilterExprString>;
  statusCode?: Maybe<FilterExprInt>;
};

export type FilterExprInt = {
  operator: FilterOperatorInt;
  value: number;
};

export type FilterExprPreset = {
  id: string;
  source: FilterExprPresetSource;
};

export const FilterExprPresetSource = {
  Name: "NAME",
  Alias: "ALIAS",
} as const;
export type FilterExprPresetSource =
  (typeof FilterExprPresetSource)[keyof typeof FilterExprPresetSource];

export type FilterExprString = {
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

export type Options = {
  presets: Maybe<FilterPreset[]>;
};
