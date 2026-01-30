/**
 * Configuration for a stateless state machine.
 *
 * Defines states, transition routes, and the evaluator.
 * The evaluator returns data that shouldAdvance uses to decide whether to advance.
 */
export type StateMachineConfig<State extends string, Input, Context, Decision, Meta=unknown> = {
  initialState: State
  routes: Record<State, State | null>
  stateMeta?: Partial<Record<State, Meta>>

  evaluator: (state: State, input: Input, context: Context, meta?: Meta) => Promise<Decision> | Decision
  shouldAdvance: (decision: Decision) => boolean
  onTransition?: (from: State, to: State, decision: Decision, didAdvance: boolean) => void
}

/** Result of applying a state transition. */
export type Transition<State, Decision> = {
  nextState: State
  decision: Decision
  didAdvance: boolean
}

/**
 * Stateless finite-state machine.
 *
 * Evaluates input in a given state and returns the resulting transition
 * without owning or mutating state.
 *
 * Used for intent routing.
 */
export class StateMachine<State extends string, Input, Context, Decision, Meta = unknown> {
  constructor(
    private readonly config: StateMachineConfig<State, Input, Context, Decision, Meta>,
  ) {}

  getInitialState(): State {
    return this.config.initialState
  }

  getNextRoute(state: State): State | null {
    return this.config.routes[state] ?? null
  }

  getStateMeta(state: State): Meta | undefined {
    return this.config.stateMeta?.[state]
  }

  /** Compute next state + return transition output. */
  async step(state: State, input: Input, context: Context): Promise<Transition<State, Decision>> {
    const meta = this.getStateMeta(state)
    const decision = await this.config.evaluator(state, input, context, meta)

    const didAdvance = this.config.shouldAdvance(decision)

    // Advance means: take the configured successor if present; otherwise stay.
    const successor = didAdvance ? this.getNextRoute(state) : state
    const nextState = successor ?? state

    this.config.onTransition?.(state, nextState, decision, didAdvance)
    return { nextState, decision, didAdvance }
  }
}
