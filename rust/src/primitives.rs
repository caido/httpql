pub struct Query {
    pub preset: Option<ExprPreset>,
    pub request: Option<ClauseRequest>,
    pub response: Option<ClauseResponse>,
    pub and: Option<Vec<Query>>,
    pub or: Option<Vec<Query>>,
}

pub struct ClauseResponse {
    pub raw: Option<ExprString>,
    pub status_code: Option<ExprInt>,
}

pub struct ClauseRequest {
    pub file_extension: Option<ExprString>,
    pub host: Option<ExprString>,
    pub method: Option<ExprString>,
    pub path: Option<ExprString>,
    pub port: Option<ExprInt>,
    pub query: Option<ExprString>,
    pub raw: Option<ExprString>,
}

pub struct ExprString {
    pub value: Option<String>,
    pub operator: OperatorString,
}

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

pub struct ExprInt {
    pub value: Option<i32>,
    pub operator: OperatorInt,
}

pub enum OperatorInt {
    Lt,
    Lte,
    Gt,
    Gte,
    Eq,
    Ne,
}

pub enum ExprPreset {
    Name(String),
    Alias(String),
}
