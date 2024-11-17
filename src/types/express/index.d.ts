export {}

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: any,
        username: string,
        role: string,
      }
    }
    export interface Response {
      success: (data: any, metadata?: any, links?: any) => void;
      error: (data: any, metadata?: any, links?: any) => void;
    }
  }
}