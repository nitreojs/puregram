export const isPlainObject = (object: object): object is Record<string, any> => (
  Object.prototype.toString.call(object) === '[object Object]'
);
