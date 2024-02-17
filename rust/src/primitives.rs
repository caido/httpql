#[derive(Clone, Debug, Default)]
pub struct Query {
    pub preset: Option<ExprPreset>,
    pub request: Option<ClauseRequest>,
    pub response: Option<ClauseResponse>,
    pub and: Option<Vec<Query>>,
    pub or: Option<Vec<Query>>,
}

#[derive(Clone, Debug, Default)]
pub struct ClauseResponse {
    pub raw: Option<ExprString>,
    pub status_code: Option<ExprInt>,
}

#[derive(Clone, Debug, Default)]
pub struct ClauseRequest {
    pub file_extension: Option<ExprString>,
    pub host: Option<ExprString>,
    pub method: Option<ExprString>,
    pub path: Option<ExprString>,
    pub port: Option<ExprInt>,
    pub query: Option<ExprString>,
    pub raw: Option<ExprString>,
}

#[derive(Clone, Debug)]
pub struct ExprString {
    pub value: Option<String>,
    pub operator: OperatorString,
}

#[derive(Clone, Debug)]
pub enum OperatorString {
    Eq,
    Ne,
    Cont,
    Ncont,
    Like,
    Nlike,
    Regex,
    Nregex,
}

#[derive(Clone, Debug)]
pub struct ExprInt {
    pub value: Option<i32>,
    pub operator: OperatorInt,
}

#[derive(Clone, Debug)]
pub enum OperatorInt {
    Lt,
    Lte,
    Gt,
    Gte,
    Eq,
    Ne,
}

#[derive(Clone, Debug)]
pub enum ExprPreset {
    Name(String),
    Alias(String),
}
