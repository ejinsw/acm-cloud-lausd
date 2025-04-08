declare global {
  declare namespace Express {
    export interface User {
      // TODO: Add User fields
    }
    // TODO: Add the rest of the schema (...or import types from ORM)
    export interface Request {
      user: User;
    }
  }
}

export {};
