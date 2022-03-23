export function isEmail(email: string) {
  const regExp = /\S+@\S+\.\S+/;
  return regExp.test(email);
}
