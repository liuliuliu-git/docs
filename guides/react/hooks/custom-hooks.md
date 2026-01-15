---
outline: deep
---

# 自定义 Hooks

自定义 Hook 是 React 中逻辑复用的核心机制，允许将组件逻辑提取为可重用的函数。

## 概述

自定义 Hook 是一个以 `use` 开头的函数，内部可以调用其他 Hook：

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

## 自定义 Hook 的规则

### 1. 以 `use` 开头

```jsx
// 推荐
function useUser() { }
function useLocalStorage() { }
function useForm() { }

// 不推荐 - 没有 use 前缀
function User() { }
function LocalStorage() { }
```

### 2. 只在顶层调用 Hooks

```jsx
// 推荐
function useUserData(userId) {
  const [user, setUser] = useState(null);  // ✓ 顶层
  const [loading, setLoading] = useState(true);  // ✓ 顶层

  useEffect(() => {
    // ...
  }, [userId]);
}

// 不推荐 - 在条件中调用
function useUserData(userId) {
  if (!userId) {
    return null;  // ✗ 提前返回
  }
  const [user, setUser] = useState(null);  // 不是顶层调用
}
```

### 3. 只在函数组件或自定义 Hooks 中调用

```jsx
// 可以在函数组件中调用
function UserProfile() {
  const user = useUser(1);  // ✓
}

// 可以在其他自定义 Hook 中调用
function useUserData(userId) {
  const user = useUser(userId);  // ✓
  // ...
}
```

## 实用自定义 Hook 示例

### 1. useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  // 惰性初始化
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('读取 localStorage 失败:', error);
      return initialValue;
    }
  });

  // 返回包装后的 setter
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('保存到 localStorage 失败:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// 使用示例
function App() {
  const [name, setName] = useLocalStorage('name', '张三');
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  );
}
```

### 2. useAsync

```jsx
import { useState, useEffect, useCallback } from 'react';

function useAsync(asyncFn, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error, execute: fetchUser } = useAsync(
    () => fetch(`/api/users/${userId}`).then(r => r.json()),
    false  // 不立即执行
  );

  return (
    <div>
      {loading && <p>加载中...</p>}
      {error && <p>错误: {error.message}</p>}
      {user && <p>{user.name}</p>}
      <button onClick={fetchUser}>刷新</button>
    </div>
  );
}
```

### 3. useToggle

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, setTrue, setFalse, setValue }];
}

// 使用示例
function Switch() {
  const [isOn, { toggle, setTrue, setFalse }] = useToggle();

  return (
    <div>
      <p>状态: {isOn ? '开' : '关'}</p>
      <button onClick={toggle}>切换</button>
      <button onClick={setTrue}>开</button>
      <button onClick={setFalse}>关</button>
    </div>
  );
}
```

### 4. useDebounce

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // 使用 debouncedQuery 进行搜索
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

### 5. useClickOutside

```jsx
import { useState, useEffect, useRef } from 'react';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 使用示例
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>
        菜单
      </button>
      {isOpen && (
        <ul>
          <li>选项 1</li>
          <li>选项 2</li>
          <li>选项 3</li>
        </ul>
      )}
    </div>
  );
}
```

### 6. useMediaQuery

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// 使用示例
function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div style={{ background: isDark ? '#333' : '#fff' }}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

## 组合多个自定义 Hook

```jsx
// 组合 useUser 和 useLocalStorage
function useAuth() {
  const [token, setToken] = useLocalStorage('authToken', null);
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
  }, [setToken]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  return { user, token, login, logout, isAuthenticated: !!token };
}
```

## 常见问题

### Q: 自定义 Hook 和普通函数有什么区别？

A: 自定义 Hook 可以调用其他 Hook，而普通函数不能：

```jsx
// 正确 - 自定义 Hook 调用了 useState 和 useEffect
function useUser(userId) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // ...
  }, [userId]);
  return user;
}

// 错误 - 普通函数不能调用 Hook
function getUser(userId) {
  const [user, setUser] = useState(null);  // ✗ 错误！
  // ...
}
```

### Q: 如何测试自定义 Hook？

A: 使用 `@testing-library/react` 的 `renderHook`：

```jsx
import { renderHook, waitFor } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

test('useLocalStorage', () => {
  const { result } = renderHook(() => useLocalStorage('test', 'default'));

  expect(result.current[0]).toBe('default');

  act(() => {
    result.current[1]('new value');
  });

  expect(result.current[0]).toBe('new value');
});
```

### Q: 自定义 Hook 应该返回什么？

A: 根据用途灵活设计：

```jsx
// 返回单个值
function useUser(userId) {
  return user;  // 直接返回
}

// 返回多个值
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  // ...
  return { values, handleChange, reset, errors };
}

// 返回数组（类似 useState）
function useToggle(initial) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}
```

## 最佳实践

1. **单一职责** - 每个 Hook 只做一件事
2. **清晰命名** - `useXxx` 命名模式
3. **文档注释** - 说明参数、返回值、使用示例
4. **处理边界情况** - undefined、null、错误
5. **可测试性** - 便于单元测试

## 相关资源

- [React 官方文档 - 自定义 Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [useState](useState.md)
- [useEffect](useEffect.md)
- [useCallback](useCallback-useMemo.md)
