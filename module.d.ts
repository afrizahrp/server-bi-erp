declare namespace NodeJS {
  export interface ProcessEnv {
    jwtSecretKey: string;
    jwtRefreshTokenKey: string;
  }
}
