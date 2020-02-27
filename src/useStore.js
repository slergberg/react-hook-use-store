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
  const builderRef = useRef({
    actions,
    initialState,
    storeExtension,
  })

  const storeActions = useMemo(() => {
    const {
      _builder: storeExtensionBuilder,
    } = builderRef.current.storeExtension

    return {
      ...(storeExtensionBuilder.actions || {}),
      ...builderRef.current.actions,
    }
  }, [builderRef])

  const storeInitialState = useMemo(() => {
    const {
      _builder: storeExtensionBuilder,
    } = builderRef.current.storeExtension

    return {
      ...(storeExtensionBuilder.initialState || {}),
      ...builderRef.current.initialState,
    }
  }, [builderRef])

  const [state, dispatch] = useActionsReducer(storeActions, storeInitialState)

  const dispatchers = useMemo(
    () =>
      Object.keys(storeActions).reduce(
        (accumulator, type) => ({
          ...accumulator,
          [type]: (payload) => dispatch({ dispatch, payload, type }),
        }),
        {},
      ),
    [dispatch, storeActions],
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
