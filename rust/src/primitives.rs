use core::fmt;

#[derive(Clone, Debug, Default)]
pub struct Query {
    pub preset: Option<ExprPreset>,
    pub request: Option<ClauseRequest>,
    pub response: Option<ClauseResponse>,
    pub and: Option<(Box<Query>, Box<Query>)>,
    pub or: Option<(Box<Query>, Box<Query>)>,
}

impl fmt::Display for Query {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.preset {
            return write!(f, "{}", expr);
        }
        if let Some(expr) = &self.request {
            return write!(f, "req.{}", expr);
        }
        if let Some(expr) = &self.response {
            return write!(f, "resp.{}", expr);
        }
        if let Some(expr) = &self.and {
            return write!(f, "({} and {})", expr.0, expr.1);
        }
        if let Some(expr) = &self.or {
            return write!(f, "({} or {})", expr.0, expr.1);
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Default)]
pub struct ClauseResponse {
    pub raw: Option<ExprString>,
    pub status_code: Option<ExprInt>,
}

impl fmt::Display for ClauseResponse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.raw {
            return write!(f, "raw.{}", expr);
        }
        if let Some(expr) = &self.status_code {
            return write!(f, "code.{}", expr);
        }
        Ok(())
    }
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

impl fmt::Display for ClauseRequest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.file_extension {
            return write!(f, "ext.{}", expr);
        }
        if let Some(expr) = &self.host {
            return write!(f, "host.{}", expr);
        }
        if let Some(expr) = &self.method {
            return write!(f, "method.{}", expr);
        }
        if let Some(expr) = &self.path {
            return write!(f, "path.{}", expr);
        }
        if let Some(expr) = &self.port {
            return write!(f, "port.{}", expr);
        }
        if let Some(expr) = &self.query {
            return write!(f, "query.{}", expr);
        }
        if let Some(expr) = &self.raw {
            return write!(f, "raw.{}", expr);
        }
        Ok(())
    }
}

#[derive(Clone, Debug)]
pub struct ExprString {
    pub value: String,
    pub operator: OperatorString,
}

impl fmt::Display for ExprString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:\"{}\"", self.operator, self.value)
    }
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

impl fmt::Display for OperatorString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperatorString::Eq => write!(f, "eq"),
            OperatorString::Ne => write!(f, "ne"),
            OperatorString::Cont => write!(f, "cont"),
            OperatorString::Ncont => write!(f, "ncont"),
            OperatorString::Like => write!(f, "like"),
            OperatorString::Nlike => write!(f, "nlike"),
            OperatorString::Regex => write!(f, "regex"),
            OperatorString::Nregex => write!(f, "nregex"),
        }
    }
}

#[derive(Clone, Debug)]
pub struct ExprInt {
    pub value: i32,
    pub operator: OperatorInt,
}

impl fmt::Display for ExprInt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}", self.operator, self.value)
    }
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

impl fmt::Display for OperatorInt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperatorInt::Lt => write!(f, "lt"),
            OperatorInt::Lte => write!(f, "lte"),
            OperatorInt::Gt => write!(f, "gt"),
            OperatorInt::Gte => write!(f, "gte"),
            OperatorInt::Eq => write!(f, "eq"),
            OperatorInt::Ne => write!(f, "ne"),
        }
    }
}

#[derive(Clone, Debug)]
pub enum ExprPreset {
    Name(String),
    Alias(String),
}

impl fmt::Display for ExprPreset {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExprPreset::Name(name) => write!(f, "preset:\"{}\"", name),
            ExprPreset::Alias(alias) => write!(f, "preset:{}", alias),
        }
    }
}
