import type { Maybe } from "./primitives";
import { isPresent } from "./utils";

export class HTTPQLError extends Error {
  source: Maybe<Error>;

  constructor(message: string) {
    super(message);
  }

  withSource<T extends Error>(source: T) {
    this.source = source;
    return this;
  }

  toString() {
    let message = "";
    message += `${this.message}`;

    const source = this.source;
    if (isPresent(source)) {
      message += `\n  Source: ${source.toString()}`;
    }
    return message;
  }
}

export class InvalidQuery extends HTTPQLError {
  readonly __typename = "InvalidHTTPQLQuery";

  constructor() {
    super(`HTTPQL query is not valid`);
  }
}
