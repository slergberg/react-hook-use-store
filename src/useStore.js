import { useCallback, useMemo, useReducer, useRef } from 'react'

export function useActionsReducer(actions, initialState) {
  const reducer = useCallback(
    (state, action) => {
      const reducerAction = actions[action.type]
      const reducerActionResult = reducerAction(
        state,
        action.payload,
        action.dispatch,
        action.type,
      )

      if (typeof reducerActionResult === 'function') {
        reducerActionResult(action.dispatch)

        return state
      }

      return reducerActionResult
    },
    [actions],
  )

  return useReducer(reducer, initialState)
}

export function useStore(actions, initialState, storeExtension = {}) {
  const { _builder: storeExtensionBuilder = {} } = storeExtension

  const builderRef = useRef({
    actions: {
      ...(storeExtensionBuilder.actions || {}),
      ...actions,
    },
    initialState: {
      ...(storeExtensionBuilder.initialState || {}),
      ...initialState,
    },
  })

  const [state, dispatch] = useActionsReducer(
    builderRef.current.actions,
    builderRef.current.initialState,
  )

  const dispatchers = useMemo(
    () =>
      Object.keys(builderRef.current.actions).reduce(
        (accumulator, type) => ({
          ...accumulator,
          [type]: (payload) => dispatch({ dispatch, payload, type }),
        }),
        {},
      ),
    [dispatch, builderRef.current.actions],
  )

  const store = useMemo(
    () => ({
      ...dispatchers,
      ...state,
      _builder: builderRef.current,
      dispatch,
    }),
    [builderRef, dispatch, dispatchers, state],
  )

  return store
}
