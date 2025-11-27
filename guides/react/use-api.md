---
outline: deep
---

# React use() API 深入学习

## 概述

`use()` 是 React 19 引入的一个新的 Hook，用于在组件中读取 Promise、Context 等资源。与传统的 `await` 不同，`use()` 是 React 渲染系统的一部分，它能够与 Suspense、错误边界等 React 特性无缝集成，提供更好的用户体验和开发体验。

::: tip 核心理解
**React 不是在等待 Promise，而是在管理 UI 渲染的生命流程。**

`use()` 是 React 的异步资源管理机制，而 `await` 是 JavaScript 的同步等待，不适合 React 渲染模型。
:::

## 为什么不能仅使用 await？

### await 的局限性

在 React 组件中使用 `await` 等待 Promise 存在以下问题：

1. **阻塞整个组件树**：`await` 会同步阻塞执行，无法中断渲染
2. **无法配合 Suspense**：无法在等待过程中显示 fallback UI
3. **无法自动缓存**：每次渲染都会重新执行异步操作
4. **无法预加载**：无法提前开始加载数据
5. **无法与错误边界集成**：错误处理不够优雅

### use() 的优势

`use()` 作为 React 渲染系统的一部分，具有以下优势：

- ✅ **非阻塞渲染**：可以暂停渲染，让 Suspense 接管 UI
- ✅ **自动缓存**：React 可以缓存 Promise 结果
- ✅ **预加载支持**：可以提前开始加载数据
- ✅ **错误边界集成**：错误可以被错误边界捕获
- ✅ **更好的用户体验**：在等待过程中显示 loading 状态

## use() 的工作原理

### React 渲染系统的集成

当组件调用 `use()` 读取 Promise 时：

1. **React 捕获 Promise**：React 知道组件正在等待一个 Promise
2. **抛出特殊异常**：在 Promise pending 时，React 会抛出特殊异常来暂停渲染
3. **Suspense 接管**：Suspense 边界捕获异常，显示 fallback UI
4. **Promise 完成**：当 Promise resolve 后，`use()` 通知 React
5. **恢复渲染**：React 重新渲染组件，显示实际内容

### 渲染流程对比

#### 使用 await（不推荐）

```jsx
// ❌ 不推荐：使用 await
async function UserProfile({ userId }) {
  const user = await fetchUser(userId); // 阻塞整个组件树
  return <div>{user.name}</div>;
}
```

问题：
- 组件必须是 async 函数（React 不支持）
- 无法中断渲染
- 无法显示 loading 状态
- 无法利用 React 的缓存机制

#### 使用 use()（推荐）

```jsx
// ✅ 推荐：使用 use()
import { use } from 'react';

function UserProfile({ userId }) {
  const user = use(fetchUser(userId)); // React 管理 Promise
  return <div>{user.name}</div>;
}

// 配合 Suspense 使用
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

优势：
- React 可以暂停渲染
- Suspense 可以显示 fallback
- 支持缓存和预加载
- 错误可以被错误边界捕获

## 基础用法

### 读取 Promise

```jsx
import { use } from 'react';

function DataComponent({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data.message}</div>;
}

// 使用示例
function App() {
  const dataPromise = fetch('/api/data').then(res => res.json());
  
  return (
    <Suspense fallback={<div>加载数据中...</div>}>
      <DataComponent dataPromise={dataPromise} />
    </Suspense>
  );
}
```

### 读取 Context

`use()` 也可以用于读取 Context，这是 `useContext()` 的替代方案：

```jsx
import { createContext, use } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = use(ThemeContext);
  return <button className={theme}>按钮</button>;
}
```

::: tip 提示
`use()` 读取 Context 时，不需要 Provider 包裹（如果 Context 有默认值），这与 `useContext()` 不同。
:::

## 与 Suspense 配合使用

### 基本 Suspense 集成

```jsx
import { use, Suspense } from 'react';

function UserPosts({ userId }) {
  const posts = use(fetchUserPosts(userId));
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <UserPosts userId={1} />
    </Suspense>
  );
}

function PostsSkeleton() {
  return <div>加载文章列表...</div>;
}
```

### 嵌套 Suspense

可以在不同层级使用多个 Suspense 边界：

```jsx
function UserPage({ userId }) {
  return (
    <div>
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo userId={userId} />
      </Suspense>
      
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}
```

这样，用户信息和文章列表可以独立加载，互不影响。

## 错误处理

### 错误边界集成

`use()` 抛出的错误可以被错误边界捕获：

```jsx
import { use, Suspense } from 'react';

function UserProfile({ userId }) {
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了，请稍后重试</h1>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>加载中...</div>}>
        <UserProfile userId={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 在组件中处理错误

也可以使用 try-catch 在组件内部处理错误：

```jsx
function DataComponent({ dataPromise }) {
  try {
    const data = use(dataPromise);
    return <div>{data.message}</div>;
  } catch (error) {
    return <div>错误: {error.message}</div>;
  }
}
```

::: warning 注意
在 Suspense 边界内，Promise pending 时抛出的异常会被 Suspense 捕获，不会进入 catch 块。只有 Promise reject 时才会进入 catch 块。
:::

## 缓存和预加载

### React 的自动缓存

React 可以自动缓存 `use()` 读取的 Promise 结果：

```jsx
function createCache() {
  const cache = new Map();
  return {
    get(key, promise) {
      if (cache.has(key)) {
        return cache.get(key);
      }
      cache.set(key, promise);
      return promise;
    }
  };
}

const cache = createCache();

function UserProfile({ userId }) {
  const userPromise = cache.get(
    `user-${userId}`,
    fetchUser(userId)
  );
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### 预加载数据

可以在需要之前提前开始加载数据：

```jsx
function App() {
  // 预加载用户数据
  const userPromise = fetchUser(1);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

## 实际应用示例

### 数据获取模式

```jsx
import { use, Suspense, useState } from 'react';

// 创建数据获取函数
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error('获取用户失败');
      return res.json();
    });
}

function UserProfile({ userId }) {
  const user = use(fetchUserData(userId));
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState(1);
  
  return (
    <div>
      <button onClick={() => setUserId(prev => prev + 1)}>
        下一个用户
      </button>
      
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  );
}

function UserProfileSkeleton() {
  return (
    <div>
      <div className="skeleton">加载用户名...</div>
      <div className="skeleton">加载邮箱...</div>
    </div>
  );
}
```

### 条件渲染

```jsx
function ConditionalData({ shouldFetch, dataPromise }) {
  if (!shouldFetch) {
    return <div>不需要加载数据</div>;
  }
  
  const data = use(dataPromise);
  return <div>{data.message}</div>;
}
```

::: warning 注意
不要在条件语句中调用 `use()`，这会导致 React 无法正确追踪 Promise。应该始终传递 Promise，在组件内部使用条件渲染。
:::

## 最佳实践

### 1. 始终配合 Suspense 使用

```jsx
// ✅ 推荐
<Suspense fallback={<Loading />}>
  <Component dataPromise={promise} />
</Suspense>

// ❌ 不推荐：没有 Suspense 边界
<Component dataPromise={promise} />
```

### 2. 在组件顶层调用 use()

```jsx
// ✅ 推荐
function Component({ promise }) {
  const data = use(promise);
  // 使用 data
}

// ❌ 不推荐：在条件或循环中调用
function Component({ promise, condition }) {
  if (condition) {
    const data = use(promise); // 错误！
  }
}
```

### 3. 使用缓存避免重复请求

```jsx
const cache = new Map();

function getCachedData(key, fetcher) {
  if (!cache.has(key)) {
    cache.set(key, fetcher());
  }
  return cache.get(key);
}
```

### 4. 提供有意义的 fallback

```jsx
// ✅ 推荐：提供具体的 loading 状态
<Suspense fallback={<UserProfileSkeleton />}>
  <UserProfile userId={1} />
</Suspense>

// ❌ 不推荐：过于简单的 fallback
<Suspense fallback={<div>Loading...</div>}>
  <UserProfile userId={1} />
</Suspense>
```

## 常见问题

### Q: use() 和 await 有什么区别？

A: 
- `await` 是 JavaScript 的同步等待机制，会阻塞执行
- `use()` 是 React 的异步资源管理机制，可以与 React 渲染系统集成
- `use()` 支持 Suspense、错误边界、缓存等 React 特性
- `await` 无法中断渲染，无法配合 Suspense 使用

### Q: 可以在 async 组件中使用 use() 吗？

A: React 组件不能是 async 函数。`use()` 就是为了解决这个问题而引入的，它允许在同步组件中读取异步资源。

### Q: use() 可以读取哪些类型的资源？

A: `use()` 主要用于读取：
- Promise（最常见）
- Context（替代 `useContext()`）

### Q: 如何处理 use() 的错误？

A: 有两种方式：
1. 使用错误边界组件捕获错误
2. 在组件内部使用 try-catch（只能捕获 reject 的错误）

### Q: use() 会缓存 Promise 结果吗？

A: React 本身不会自动缓存，但你可以实现自己的缓存机制。React 会在同一渲染周期内复用相同的 Promise。

## 进阶内容

### 实现自定义缓存

```jsx
function createResource(fetcher) {
  const cache = new Map();
  
  return function(key) {
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (cached.status === 'success') {
        return cached.data;
      }
      if (cached.status === 'error') {
        throw cached.error;
      }
      throw cached.promise;
    }
    
    const promise = fetcher(key)
      .then(data => {
        cache.set(key, { status: 'success', data });
        return data;
      })
      .catch(error => {
        cache.set(key, { status: 'error', error });
        throw error;
      });
    
    cache.set(key, { status: 'pending', promise });
    throw promise;
  };
}

// 使用示例
const fetchUser = createResource(async (userId) => {
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
});

function UserProfile({ userId }) {
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}
```

### 与 Server Components 集成

在 Next.js 等支持 Server Components 的框架中，`use()` 可以在客户端组件中读取服务端传递的 Promise：

```jsx
// Server Component
async function ServerComponent() {
  const data = await fetchData();
  return <ClientComponent dataPromise={Promise.resolve(data)} />;
}

// Client Component
'use client';
function ClientComponent({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data.message}</div>;
}
```

## 总结

`use()` API 是 React 19 引入的重要特性，它解决了在组件中处理异步资源的根本问题：

1. **与 React 渲染系统集成**：可以暂停和恢复渲染
2. **配合 Suspense**：提供优雅的 loading 状态
3. **错误边界支持**：统一的错误处理机制
4. **缓存和预加载**：提升性能和用户体验

记住核心原则：**React 不是在等待 Promise，而是在管理 UI 渲染的生命流程。**

## 参考链接

- [React 官方文档 - use()](https://react.dev/reference/react/use)
- [React 官方文档 - Suspense](https://react.dev/reference/react/Suspense)
- [React 官方文档 - 错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

