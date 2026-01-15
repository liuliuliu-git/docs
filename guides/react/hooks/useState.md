---
outline: deep
---

# useState 深入指南

`useState` 是 React 中最基础的状态 Hook，用于在函数组件中添加状态。

## 概述

```jsx
const [state, setState] = useState(initialValue);
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `initialValue` | 任意值或函数 | 初始状态，可以是值或惰性初始化函数 |

### 返回值

| 返回值 | 类型 | 描述 |
|--------|------|------|
| `state` | 任意值 | 当前状态 |
| `setState` | 函数 | 更新状态的函数 |

## 基础用法

### 简单状态

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
```

### 对象状态

```jsx
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  return (
    <form>
      <input
        value={user.name}
        onChange={e => setUser({ ...user, name: e.target.value })}
      />
      <input
        value={user.email}
        onChange={e => setUser({ ...user, email: e.target.value })}
      />
    </form>
  );
}
```

### 数组状态

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { text, done: false }]);
  };

  const toggleTodo = (index) => {
    setTodos(todos.map((todo, i) =>
      i === index ? { ...todo, done: !todo.done } : todo
    ));
  };

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index} onClick={() => toggleTodo(index)}>
          {todo.text} - {todo.done ? '完成' : '未完成'}
        </li>
      ))}
    </ul>
  );
}
```

## 惰性初始化

当初始状态需要复杂计算时，使用函数避免每次渲染都重新计算：

```jsx
// 不推荐 - 每次渲染都执行
const [data, setData] = useState(expensiveComputation());

// 推荐 - 只执行一次
const [data, setData] = useState(() => expensiveComputation());
```

### 实际示例

```jsx
function ExpensiveComponent({ userId }) {
  // 每次渲染都重新计算
  const [data, setData] = useState(initializeData(userId));

  // 只在初始化时计算一次
  const [data, setData] = useState(() => {
    console.log('初始化数据...');
    return initializeData(userId);
  });

  return <div>{/* 使用 data */}</div>;
}

function initializeData(userId) {
  // 模拟昂贵的计算
  console.log('执行初始化逻辑...');
  return {
    userId,
    loaded: true,
    timestamp: Date.now()
  };
}
```

## 更新状态

### 函数式更新

当新状态依赖之前状态时，使用函数式更新：

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // 推荐 - 使用函数式更新
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  // 不推荐 - 直接使用当前值（可能过时）
  const incrementOld = () => setCount(count + 1);
}
```

### 为什么需要函数式更新？

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // 在批量更新中，count 可能不会立即更新
  const handleClick = () => {
    setCount(count + 1);  // 使用的是旧值
    setCount(count + 1);  // 仍然是旧值
    setCount(count + 1);  // 仍然是旧值
  };
  // 最终 count = 1，而不是 3

  // 函数式更新确保基于最新状态
  const handleClickCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
  // 最终 count = 3
}
```

## 状态设计原则

### 1. 保持状态原子化

```jsx
// 不推荐 - 混合不相关的状态
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  address: {
    street: '',
    city: ''
  }
});

// 推荐 - 拆分独立的状态
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [address, setAddress] = useState({
  street: '',
  city: ''
});
```

### 2. 避免状态冗余

```jsx
// 不推荐 - 派生数据放在状态中
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const [fullName, setFullName] = useState('John Doe');  // 冗余！

// 推荐 - 使用派生值
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const fullName = `${firstName} ${lastName}`;  // 自动派生
```

### 3. 状态提升

```jsx
// 子组件
function Child({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// 父组件 - 管理共享状态
function Parent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div>
      <Child value={name} onChange={setName} />
      <Child value={email} onChange={setEmail} />
    </div>
  );
}
```

## 批量更新

React 18+ 在所有更新中自动批量处理：

```jsx
function handleClick() {
  setCount(c => c + 1);  // 批量处理
  setFlag(f => !f);      // 批量处理
  setAge(a => a + 1);    // 批量处理
  // 只会触发一次重新渲染
}
```

### React 18 前后的对比

```jsx
// React 18 之前（传统模式）
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 可能触发两次渲染
}

// React 18+（自动批量）
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次渲染
}
```

## 最佳实践

### 1. 使用有意义的状态命名

```jsx
// 不推荐
const [d, setD] = useState(0);  // 名称不清晰
const [data, setData] = useState({});  // 太泛泛

// 推荐
const [count, setCount] = useState(0);
const [userData, setUserData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
```

### 2. 提供合理的初始值

```jsx
// 不推荐
const [items, setItems] = useState(null);  // null 可能导致类型检查问题
const [filter, setFilter] = useState(undefined);

// 推荐
const [items, setItems] = useState([]);  // 空数组更合理
const [filter, setFilter] = useState('');  // 空字符串更合理
```

### 3. 使用 useReducer 处理复杂状态

```jsx
import { useReducer } from 'react';

const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={e => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      />
    </div>
  );
}
```

## 常见问题

### Q: 为什么状态更新后立即读取不到新值？

A: `setState` 是异步的。不要在更新后立即读取状态：

```jsx
// 不推荐
setCount(5);
console.log(count);  // 可能是旧值

// 推荐 - 使用 useEffect 监听变化
const [count, setCount] = useState(0);
useEffect(() => {
  console.log('count 已更新:', count);
}, [count]);

// 或者使用回调形式
setCount(5);
setTimeout(() => setCount(prev => {
  console.log('新值:', prev);
  return prev;
}), 0);
```

### Q: 如何在初始化后执行代码？

A: 使用 `useEffect`：

```jsx
function MyComponent() {
  const [data, setData] = useState(null);

  // 初始化后获取数据
  useEffect(() => {
    fetchData().then(setData);
  }, []);  // 空依赖数组 - 只执行一次

  return <div>{/* 使用 data */}</div>;
}
```

### Q: useState 和 useReducer 什么时候用？

A:
- **useState**：简单状态（数字、字符串、简单对象）
- **useReducer**：复杂状态逻辑、多个相关状态、状态更新依赖复杂逻辑

## 相关资源

- [React 官方文档 - useState](https://react.dev/reference/react/useState)
- [useReducer](useReducer.md)
- [useEffect](useEffect.md) - 处理副作用
