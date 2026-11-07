declare module '*.png';
declare module '*.jpeg';
declare module '*.jpg';
declare module '*.svg' {
  const content: any;
  export default content;
}
