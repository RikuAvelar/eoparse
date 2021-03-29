export const ac = (type, payload) => ({type, payload})

export const wrapDispatch = dispatch => (...args) => dispatch(ac(...args))