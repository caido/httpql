use thiserror::Error;

// NOTE: Even though the "expected" way to do things in Pest
// is to use unwrap and unimplemented, we really prefer not
// to panic in our code. So using some helpers.
pub(crate) trait HTTPQLErrorExt<T> {
    fn required(self, token: &str) -> Result<T>;
}

impl<T> HTTPQLErrorExt<T> for Option<T> {
    fn required(self, token: &str) -> Result<T> {
        match self {
            Some(value) => Ok(value),
            None => Err(ParserError::MissingToken(token.to_string()).into()),
        }
    }
}

impl<T, E> HTTPQLErrorExt<T> for std::result::Result<T, E> {
    fn required(self, token: &str) -> Result<T> {
        match self {
            Ok(value) => Ok(value),
            Err(_) => Err(ParserError::InvalidToken(token.to_string()).into()),
        }
    }
}

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("Missing required token: {0}")]
    MissingToken(String),

    #[error("Unknown token: {0}")]
    UnknownToken(String),

    #[error("Invalid token: {0}")]
    InvalidToken(String),
}

#[derive(Error, Debug)]
pub enum HTTPQLError {
    #[error("Parser error")]
    ParserError(#[source] Box<ParserError>),

    #[error("Lexer Error")]
    LexerError(#[source] Box<pest::error::Error<crate::parser::Rule>>),
}

impl From<pest::error::Error<crate::parser::Rule>> for HTTPQLError {
    fn from(value: pest::error::Error<crate::parser::Rule>) -> Self {
        HTTPQLError::LexerError(Box::new(value))
    }
}

impl From<ParserError> for HTTPQLError {
    fn from(value: ParserError) -> Self {
        HTTPQLError::ParserError(Box::new(value))
    }
}

pub(super) type Result<T> = std::result::Result<T, HTTPQLError>;

macro_rules! unknown {
    ($msg:literal) => {
        return Err(ParserError::UnknownToken($msg.to_string()).into())
    };
    ($fmt:expr, $($arg:tt)*) => {
        return Err(ParserError::UnknownToken(format!($fmt, $($arg)*)).into())
    };
}

macro_rules! invalid {
    ($msg:literal) => {
        return Err(ParserError::InvalidToken($msg.to_string()).into())
    };
    ($fmt:expr, $($arg:tt)*) => {
        return Err(ParserError::InvalidToken(format!($fmt, $($arg)*)).into())
    };
}

pub(crate) use {invalid, unknown};
