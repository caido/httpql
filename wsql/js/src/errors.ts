import type { Maybe } from "./primitives.js";
import { isPresent } from "./utils.js";

export class WSQLError extends Error {
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

export class InvalidQuery extends WSQLError {
  readonly __typename = "InvalidQuery";

  constructor() {
    super(`WSQL query is not valid`);
  }
}
