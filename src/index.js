import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider, connect } from "react-redux";
import { loadState, saveState } from "./localStorage";
import logger from "redux-logger";
import throttle from "lodash/throttle";

const persistedState = loadState() || { count: 0 };

// React component
class Counter extends Component {
  render() {
    const { value, onIncreaseClick, onDecreaseClick } = this.props;
    return (
      <div>
        <span>{value}</span>
        <button onClick={onIncreaseClick}>Increase</button>
        <button onClick={onDecreaseClick}>Decrease</button>
      </div>
    );
  }
}

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  onIncreaseClick: PropTypes.func.isRequired,
  onDecreaseClick: PropTypes.func.isRequired
};

// Action
const increaseAction = { type: "increase" };
const decreaseAction = { type: "decrease" };

// Reducer
function counter(state = { count: 0 }, action) {
  const count = state.count;
  switch (action.type) {
    case "increase":
      return { count: count + 1 };
    case "decrease":
      return { count: count - 1 };
    default:
      return state;
  }
}

// Store
const store = createStore(counter, persistedState, applyMiddleware(logger));

store.subscribe(
  throttle(() => {
    const { count } = store.getState();
    saveState({
      count
    });
    console.debug("saveState");
  }, 1000)
); // At most once this length of time.

// Map Redux state to component props
function mapStateToProps(state) {
  return {
    value: state.count
  };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction),
    onDecreaseClick: () => dispatch(decreaseAction)
  };
}

// Connected Component
const App = connect(mapStateToProps, mapDispatchToProps)(Counter);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
