import ember from 'ember';
export function eq([left, right]) {
  return left === right;
}
export default ember.Helper.helper(eq);