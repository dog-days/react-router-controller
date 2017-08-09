export function test(state = {}, action) {
  switch (action.type) {
    case '@test':
      return Object.assign({},action.payload);
    default:
      return state;
  }
}

export function test2(state = {}, action) {
  switch (action.type) {
    case '@test2':
      return Object.assign({},action);
    default:
      return state;
  }
}
