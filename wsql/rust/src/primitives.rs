use core::fmt;

#[derive(Clone, Debug, Default)]
pub struct Query {
    pub stream: Option<ClauseStream>,
    pub websocket: Option<ClauseWs>,
    pub and: Option<(Box<Query>, Box<Query>)>,
    pub or: Option<(Box<Query>, Box<Query>)>,
}

impl fmt::Display for Query {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.stream {
            return write!(f, "stream.{}", expr);
        }
        if let Some(expr) = &self.websocket {
            return write!(f, "ws.{}", expr);
        }
        if let Some(expr) = &self.and {
            return write!(f, "({} and {})", expr.0, expr.1);
        }
        if let Some(expr) = &self.or {
            return write!(f, "({} or {})", expr.0, expr.1);
        }
        write!(f, "()")
    }
}

#[derive(Clone, Debug, Default)]
pub struct ClauseStream {
    pub host: Option<ExprString>,
    pub path: Option<ExprString>,
    pub source: Option<ExprString>,
    pub protocol: Option<ExprString>,
    pub port: Option<ExprInt>,
    pub is_tls: Option<ExprBool>,
}

impl fmt::Display for ClauseStream {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.host {
            return write!(f, "host.{}", expr);
        }
        if let Some(expr) = &self.path {
            return write!(f, "path.{}", expr);
        }
        if let Some(expr) = &self.source {
            return write!(f, "source.{}", expr);
        }
        if let Some(expr) = &self.protocol {
            return write!(f, "protocol.{}", expr);
        }
        if let Some(expr) = &self.port {
            return write!(f, "port.{}", expr);
        }
        if let Some(expr) = &self.is_tls {
            return write!(f, "tls.{}", expr);
        }

        Err(fmt::Error)
    }
}

#[derive(Clone, Debug, Default)]
pub struct ClauseWs {
    pub direction: Option<ExprString>,
    pub raw: Option<ExprString>,
    pub format: Option<ExprString>,
    pub created_at: Option<ExprDate>,
}

impl fmt::Display for ClauseWs {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(expr) = &self.created_at {
            return write!(f, "created_at.{}", expr);
        }
        if let Some(expr) = &self.direction {
            return write!(f, "direction.{}", expr);
        }
        if let Some(expr) = &self.raw {
            return write!(f, "raw.{}", expr);
        }
        if let Some(expr) = &self.format {
            return write!(f, "format.{}", expr);
        }
        Err(fmt::Error)
    }
}

#[derive(Clone, Debug)]
pub struct ExprString {
    pub value: String,
    pub operator: OperatorString,
    pub is_raw: bool,
}

impl fmt::Display for ExprString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.is_raw {
            write!(f, r"{}:/{}/", self.operator, self.value)
        } else {
            write!(
                f,
                "{}:{}",
                self.operator,
                serde_json::to_string(self.value.as_str()).expect("Failed to serialize string")
            )
        }
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
pub struct ExprDate {
    pub value: String,
    pub operator: OperatorDate,
}

impl fmt::Display for ExprDate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:\"{}\"", self.operator, self.value)
    }
}

#[derive(Clone, Debug)]
pub enum OperatorDate {
    Lt,
    Gt,
}

impl fmt::Display for OperatorDate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperatorDate::Lt => write!(f, "lt"),
            OperatorDate::Gt => write!(f, "gt"),
        }
    }
}

#[derive(Clone, Debug)]
pub struct ExprBool {
    pub value: bool,
    pub operator: OperatorBool,
}

impl fmt::Display for ExprBool {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}", self.operator, self.value)
    }
}

#[derive(Clone, Debug)]
pub enum OperatorBool {
    Eq,
    Ne,
}

impl fmt::Display for OperatorBool {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperatorBool::Eq => write!(f, "eq"),
            OperatorBool::Ne => write!(f, "ne"),
        }
    }
}
