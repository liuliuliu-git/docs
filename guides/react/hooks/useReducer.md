---
outline: deep
---

# useReducer 深入指南

`useReducer` 是 React 中用于管理复杂状态的 Hook，类似于 Redux 的模式。

## 概述

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `reducer` | 函数 | 状态更新逻辑函数 |
| `initialState` | 任意值 | 初始状态 |

### 返回值

| 返回值 | 类型 | 描述 |
|--------|------|------|
| `state` | 任意值 | 当前状态 |
| `dispatch` | 函数 | 触发状态更新的函数 |

## 基础用法

### 计数器示例

```jsx
import { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </div>
  );
}
```

### 带 payload 的 action

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { count: action.payload };
    case 'increment':
      return { count: state.count + action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'set', payload: 10 })}>设为 10</button>
      <button onClick={() => dispatch({ type: 'increment', payload: 5 })}>+5</button>
    </div>
  );
}
```

## useState vs useReducer

| 场景 | useState | useReducer |
|------|----------|------------|
| 状态类型 | 简单类型 | 复杂对象 |
| 状态逻辑 | 简单 | 多个相关状态 |
| 更新逻辑 | 简单 | 复杂、有条件 |
| 回调形式 | 直接更新 | 通过 dispatch |

```jsx
// useState - 简单状态
const [count, setCount] = useState(0);
setCount(count + 1);

// useReducer - 复杂状态
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'increment' });
```

## 惰性初始化

```jsx
function init(initialCount) {
  return { count: initialCount, timestamp: Date.now() };
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, 0, init);
  return <div>{state.count}</div>;
}
```

## 最佳实践

### 1. 使用有意义 action 类型

```jsx
// 推荐 - 使用常量
const ACTIONS = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  SET: 'SET'
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.INCREMENT:
      return { ...state, count: state.count + 1 };
    // ...
  }
}

// 或者使用 Symbol
const TYPES = {
  INCREMENT: Symbol('INCREMENT')
};
```

### 2. 使用 useReducer 替代多个 useState

```jsx
// 不推荐 - 多个独立状态
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');

// 推荐 - 相关状态合并
function formReducer(state, action) {
  switch (action.type) {
    case 'setField':
      return { ...state, [action.field]: action.value };
    case 'reset':
        return initialState;
    default:
      return state;
  }
}

function Form() {
  const [form, dispatch] = useReducer(formReducer, {
    firstName: '',
    lastName: '',
    email: ''
  });

  return (
    <form>
      <input
        value={form.firstName}
        onChange={e => dispatch({
          type: 'setField',
          field: 'firstName',
          value: e.target.value
        })}
      />
    </form>
  );
}
```

## 常见问题

### Q: dispatch 不会触发更新？

A: `dispatch` 总是会触发重新渲染，即使状态没有变化：

```jsx
dispatch({ type: 'same' });  // 会触发重新渲染
```

### Q: 如何访问当前状态？

A: reducer 函数中通过参数访问，也可以使用 useReducer 的返回值：

```jsx
function reducer(state, action) {
  // state 是当前状态
  return newState;
}

function MyComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // state 也是当前状态
}
```

### Q: useReducer 和 Redux 有什么区别？

A:
- **useReducer** - 本地组件状态
- **Redux** - 全局应用状态、中间件、时间旅行

## 相关资源

- [React 官方文档 - useReducer](https://react.dev/reference/react/useReducer)
- [useState](useState.md)
