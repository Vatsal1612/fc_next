// Type declarations for CSS side-effect imports (e.g. import "@/styles/globals.css")
// Without this file TypeScript raises TS2882 "Cannot find module or type declarations
// for side-effect import" when moduleResolution is set to "bundler".
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
