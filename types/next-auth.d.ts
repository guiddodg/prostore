declare module "next-auth" {
  interface Session {
    user?: {
      role: string;
    } 
  }
}