// src/types/hono.d.ts
import "hono";

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: {
      id: string;
      name: string;
      tel: string;
      role: string;
      iat: number;
      exp: number;
    };
  }
}
