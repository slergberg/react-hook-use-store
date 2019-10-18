import { useCallback, useMemo, useReducer } from 'react'

const useStore = (actionsOrReducer, initialState) => {
  const reducer = useCallback(
    (state, action) => {
      if (typeof actionsOrReducer === 'function') {
        return actionsOrReducer(state, action)
      }

      const reducerAction = actionsOrReducer[action.type]
      const reducerActionResult = reducerAction(
        state,
        action.payload,
        action.type,
      )

      if (typeof reducerActionResult === 'function') {
        reducerActionResult(action.dispatch)

        return state
      }

      return reducerActionResult
    },
    [actionsOrReducer],
  )

  const [state, dispatch] = useReducer(reducer, initialState)

  const dispatchers = useMemo(() => {
    if (typeof actionsOrReducer === 'function') {
      return {}
    }

    return Object.keys(actionsOrReducer).reduce(
      (accumulator, type) => ({
        ...accumulator,
        [type]: (payload) => dispatch({ dispatch, payload, type }),
      }),
      {},
    )
  }, [dispatch, actionsOrReducer])

  const store = useMemo(
    () => ({
      ...dispatchers,
      ...state,
      dispatch,
    }),
    [dispatch, dispatchers, state],
  )

  return store
}

export default useStore
