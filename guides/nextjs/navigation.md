---
outline: deep
---

# Next.js App Router 路由导航

## 概述

在 Next.js App Router 中，路由导航是构建单页应用（SPA）体验的核心功能。Next.js 提供了多种导航方式，每种方式都有其特定的使用场景和优势。理解这些导航方式的区别和最佳实践，对于构建高性能、用户体验良好的应用至关重要。

### App Router 中的导航方式

Next.js App Router 提供了以下几种导航方式：

1. **Link 组件** - 声明式导航，基于原生 `<a>` 标签扩展
2. **useRouter Hook** - 命令式导航，仅在客户端使用
3. **redirect 函数** - 服务端和客户端重定向
4. **浏览器 History API** - 原生 API（基本不需要使用）

### 与 Pages Router 的区别

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| Link 组件 | `next/link` | `next/link`（相同） |
| useRouter | `next/router` | `next/navigation` |
| 重定向 | `next/router` 的 `router.push` | `next/navigation` 的 `redirect` |
| 预取机制 | 自动预取 | 智能预取（更优化） |

::: tip 重要提示
在 App Router 中，`useRouter` 从 `next/navigation` 导入，而不是 `next/router`。这是与 Pages Router 的主要区别之一。
:::

## Link 组件

`Link` 组件是 Next.js 中最常用的导航方式，它基于原生 `<a>` 标签扩展，提供了预处理、保持滚动位置、动态渲染等增强功能。

### 基础用法

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/about">关于我们</Link>
      <Link href="/contact">联系我们</Link>
    </nav>
  )
}
```

### 核心特性

#### 1. 预处理（Prefetch）

`Link` 组件默认会在链接进入视口或悬停时自动预取目标路由，提升导航性能。

```tsx
import Link from 'next/link'

// 默认启用预取
<Link href="/dashboard">仪表板</Link>

// 禁用预取
<Link href="/dashboard" prefetch={false}>
  仪表板
</Link>
```

**prefetch 属性值：**
- `true`（默认）- 自动预取
- `false` - 禁用预取
- `null` - 恢复默认行为（用于动态控制）

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export function HoverPrefetchLink({ href, children }) {
  const [active, setActive] = useState(false)

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
    >
      {children}
    </Link>
  )
}
```

#### 2. 保持滚动位置（Scroll）

默认情况下，导航到新页面时会滚动到顶部。可以通过 `scroll` 属性控制这个行为。

```tsx
import Link from 'next/link'

// 默认行为：导航后滚动到顶部
<Link href="/about">关于我们</Link>

// 保持当前滚动位置
<Link href="/about" scroll={false}>
  关于我们
</Link>
```

#### 3. 替换历史记录（Replace）

使用 `replace` 属性可以替换当前历史记录条目，而不是添加新条目。这会影响浏览器的后退按钮行为。

```tsx
import Link from 'next/link'

// 添加新历史记录条目（默认）
<Link href="/dashboard">仪表板</Link>

// 替换当前历史记录条目
<Link href="/dashboard" replace>
  仪表板
</Link>
```

::: tip 使用场景
`replace` 属性常用于登录后的重定向，避免用户通过后退按钮返回到登录页面。
:::

#### 4. 动态渲染

`Link` 组件支持动态路由和查询参数，可以动态生成链接。

```tsx
import Link from 'next/link'

export default function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

#### 5. 外部链接处理

对于外部链接，`Link` 组件会自动回退到原生 `<a>` 标签的行为。

```tsx
import Link from 'next/link'

// 外部链接会自动使用原生 <a> 标签
<Link href="https://example.com">外部网站</Link>

// 或者直接使用原生 <a> 标签
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  外部网站
</a>
```

::: warning 安全提示
使用外部链接时，建议添加 `rel="noopener noreferrer"` 属性以防止安全漏洞。
:::

### 完整示例

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      {/* 基础链接 */}
      <Link href="/">首页</Link>
      
      {/* 禁用预取 */}
      <Link href="/heavy-page" prefetch={false}>
        重型页面
      </Link>
      
      {/* 保持滚动位置 */}
      <Link href="/long-page" scroll={false}>
        长页面
      </Link>
      
      {/* 替换历史记录 */}
      <Link href="/login-success" replace>
        登录成功
      </Link>
      
      {/* 动态路由 */}
      <Link href={`/user/${userId}`}>
        用户资料
      </Link>
      
      {/* 带查询参数 */}
      <Link href="/search?q=nextjs&page=1">
        搜索
      </Link>
    </nav>
  )
}
```

## useRouter Hook

`useRouter` 是一个客户端 Hook，用于在组件中进行命令式导航。它只能在客户端组件中使用。

### 导入方式

```tsx
'use client'

import { useRouter } from 'next/navigation' // App Router
// 注意：不是 'next/router'（那是 Pages Router 的）
```

::: warning 重要提示
在 App Router 中，`useRouter` 必须从 `next/navigation` 导入。从 `next/router` 导入的是 Pages Router 的版本，两者 API 不同。
:::

### 主要方法

#### 1. push() - 导航到新路由

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/dashboard')}>
      前往仪表板
    </button>
  )
}
```

**push 方法的选项：**

```tsx
router.push('/dashboard', { scroll: false }) // 不滚动到顶部
```

#### 2. replace() - 替换当前路由

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.replace('/dashboard')}>
      替换当前路由
    </button>
  )
}
```

#### 3. refresh() - 刷新当前路由

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.refresh()}>
      刷新页面
    </button>
  )
}
```

::: tip 使用场景
`refresh()` 常用于在数据更新后刷新当前页面，重新获取服务端数据。
:::

#### 4. back() - 返回上一页

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.back()}>
      返回
    </button>
  )
}
```

#### 5. forward() - 前进到下一页

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.forward()}>
      前进
    </button>
  )
}
```

#### 6. prefetch() - 手动预取路由

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // 手动预取路由
    router.prefetch('/dashboard')
  }, [router])

  return <div>页面内容</div>
}
```

### 完整示例

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NavigationExample() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogin = async () => {
    // 登录逻辑...
    // 登录成功后替换当前路由
    router.replace('/dashboard')
  }

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索..."
      />
      <button onClick={handleSearch}>搜索</button>
      
      <button onClick={handleLogin}>登录</button>
      
      <button onClick={() => router.back()}>返回</button>
      <button onClick={() => router.forward()}>前进</button>
      <button onClick={() => router.refresh()}>刷新</button>
    </div>
  )
}
```

### 与 Pages Router 的区别

| 方法 | Pages Router | App Router |
|------|-------------|------------|
| push | `router.push(url, as, options)` | `router.push(url, options)` |
| replace | `router.replace(url, as, options)` | `router.replace(url, options)` |
| back | `router.back()` | `router.back()` |
| forward | `router.forward()` | `router.forward()` |
| refresh | 无 | `router.refresh()` |
| prefetch | `router.prefetch(url)` | `router.prefetch(url)` |

::: tip 迁移提示
从 Pages Router 迁移到 App Router 时，注意 `push` 和 `replace` 方法的参数变化，App Router 不再支持 `as` 参数（用于 URL 掩蔽）。
:::

## redirect 方法

`redirect` 和 `permanentRedirect` 是 Next.js 提供的重定向函数，可以在服务端组件、Server Actions、客户端组件和中间件中使用。

### redirect() - 临时重定向

`redirect()` 函数执行临时重定向，Next.js 规定使用 **307** 状态码。

```tsx
import { redirect } from 'next/navigation'

// 在服务端组件中使用
async function Page() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login') // 临时重定向到登录页
  }
  
  return <div>欢迎，{user.name}</div>
}
```

### permanentRedirect() - 永久重定向

`permanentRedirect()` 函数执行永久重定向，Next.js 规定使用 **308** 状态码。

```tsx
import { permanentRedirect } from 'next/navigation'

// 在服务端组件中使用
async function Page() {
  const product = await getProduct()
  
  if (product.moved) {
    permanentRedirect(`/products/${product.newId}`) // 永久重定向
  }
  
  return <div>{product.name}</div>
}
```

### 参数说明

两个函数都接受以下参数：

- **path**（必需）：字符串类型，表示重定向的目标 URL
  - 支持相对路径：`'/dashboard'`
  - 支持绝对路径：`'https://example.com'`
  
- **type**（可选）：`'replace'` 或 `'push'`，用于控制重定向的行为
  - 在 **Server Actions** 中：默认使用 `'push'`，会将新页面添加到浏览器历史记录
  - 在 **其他场景** 中：默认使用 `'replace'`，会替换当前的浏览器历史记录
  - **注意**：`type` 参数在服务端组件中无效，仅在客户端组件和 Server Actions 中生效

### 使用场景

#### 1. 在服务端组件中使用

```tsx
import { redirect } from 'next/navigation'

async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)
  
  if (!user) {
    redirect('/404') // 重定向到 404 页面
  }
  
  return <div>用户资料：{user.name}</div>
}
```

#### 2. 在 Server Actions 中使用

```tsx
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  
  // 创建文章
  const post = await savePost({ title })
  
  // 重新验证缓存
  revalidatePath('/posts')
  
  // 重定向到新文章（默认使用 push）
  redirect(`/posts/${post.id}`)
  
  // 或者显式指定 type
  // redirect(`/posts/${post.id}`, 'push')
}
```

```tsx
'use client'

import { createPost } from './actions'

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="文章标题" />
      <button type="submit">创建</button>
    </form>
  )
}
```

#### 3. 在客户端组件中使用

```tsx
'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export function ClientRedirect({ shouldRedirect }) {
  useEffect(() => {
    if (shouldRedirect) {
      redirect('/dashboard') // 默认使用 replace
    }
  }, [shouldRedirect])
  
  return null
}
```

::: warning 注意事项
在客户端组件中使用 `redirect` 时，它会在客户端执行重定向。如果需要在服务端重定向，应该在服务端组件或 Server Actions 中使用。
:::

#### 4. 在中间件中使用

在中间件中，需要使用 `NextResponse.redirect()` 而不是 `redirect()` 函数。

```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查认证
  if (!request.cookies.get('token')) {
    // 使用 NextResponse.redirect
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

**永久重定向示例：**

```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 永久重定向（308）
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.redirect(
      new URL('/new-path', request.url),
      { status: 308 }
    )
  }
  
  return NextResponse.next()
}
```

### 307 vs 308 的区别

| 状态码 | 函数 | 说明 | 使用场景 |
|--------|------|------|----------|
| 307 | `redirect()` | 临时重定向 | 登录重定向、条件重定向 |
| 308 | `permanentRedirect()` | 永久重定向 | URL 永久迁移、SEO 优化 |

::: tip SEO 提示
使用 `permanentRedirect` 时，搜索引擎会更新索引，将旧 URL 的权重转移到新 URL。这对于 URL 迁移和 SEO 优化很重要。
:::

### type 参数详解

```tsx
'use server'

import { redirect } from 'next/navigation'

export async function handleFormSubmit(formData: FormData) {
  // 处理表单数据...
  
  // Server Actions 中默认使用 'push'
  redirect('/success') // 等同于 redirect('/success', 'push')
  
  // 显式指定 'replace'
  // redirect('/success', 'replace')
}
```

```tsx
'use client'

import { redirect } from 'next/navigation'

export function ClientComponent() {
  const handleClick = () => {
    // 客户端组件中默认使用 'replace'
    redirect('/dashboard') // 等同于 redirect('/dashboard', 'replace')
    
    // 显式指定 'push'
    // redirect('/dashboard', 'push')
  }
  
  return <button onClick={handleClick}>跳转</button>
}
```

::: warning 重要提示
`type` 参数在服务端组件中无效。在服务端组件中使用 `redirect` 时，无法控制历史记录行为。
:::

## 其他导航相关的 Hook

Next.js 还提供了其他有用的 Hook 来获取路由信息和操作查询参数。

### usePathname() - 获取当前路径名

```tsx
'use client'

import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav>
      <Link href="/" className={pathname === '/' ? 'active' : ''}>
        首页
      </Link>
      <Link href="/about" className={pathname === '/about' ? 'active' : ''}>
        关于
      </Link>
    </nav>
  )
}
```

### useSearchParams() - 获取和操作查询参数

```tsx
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export default function SearchFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  // 创建查询字符串
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )
  
  const sort = searchParams.get('sort') || 'asc'
  
  return (
    <div>
      <p>当前排序：{sort}</p>
      
      <button
        onClick={() => {
          router.push(pathname + '?' + createQueryString('sort', 'asc'))
        }}
      >
        升序
      </button>
      
      <button
        onClick={() => {
          router.push(pathname + '?' + createQueryString('sort', 'desc'))
        }}
      >
        降序
      </button>
    </div>
  )
}
```

### useParams() - 获取动态路由参数

```tsx
'use client'

import { useParams } from 'next/navigation'

export default function ProductPage() {
  const params = useParams()
  // 假设路由是 /products/[id]
  const productId = params.id as string
  
  return <div>产品 ID: {productId}</div>
}
```

**多个动态参数：**

```tsx
'use client'

import { useParams } from 'next/navigation'

export default function BlogPost() {
  const params = useParams()
  // 假设路由是 /blog/[...slug]
  const slug = params.slug as string[]
  
  return <div>路径: {slug.join('/')}</div>
}
```

### 组合使用示例

```tsx
'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export default function ProductFilters() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'price'
  
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, searchParams, router]
  )
  
  return (
    <div>
      <select
        value={category}
        onChange={(e) => updateFilter('category', e.target.value)}
      >
        <option value="all">全部</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>
      
      <select
        value={sort}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        <option value="price">价格</option>
        <option value="name">名称</option>
        <option value="date">日期</option>
      </select>
    </div>
  )
}
```

## 浏览器 History API

虽然可以使用浏览器原生的 History API（`window.history.pushState`、`window.history.replaceState`），但在 Next.js 中**基本不需要使用**。

### 为什么不推荐使用

1. **失去 Next.js 优化**：不会触发 Next.js 的预取、代码分割等优化
2. **状态管理问题**：可能导致 Next.js 内部状态不同步
3. **类型安全**：没有 TypeScript 类型支持
4. **功能缺失**：无法利用 Next.js 的路由特性

### 如果必须使用

```tsx
'use client'

export function CustomNavigation() {
  const handleCustomNav = () => {
    // 不推荐，但技术上可行
    window.history.pushState({}, '', '/dashboard')
    // 需要手动触发路由更新
    window.location.reload() // 这会刷新整个页面
  }
  
  return <button onClick={handleCustomNav}>自定义导航</button>
}
```

::: warning 强烈不推荐
除非有特殊需求，否则应该使用 Next.js 提供的导航方法，而不是直接操作 History API。
:::

## 使用场景对比

### 何时使用 Link

- ✅ 声明式导航（推荐用于大多数场景）
- ✅ 需要 SEO 友好的链接
- ✅ 需要自动预取优化
- ✅ 导航栏、菜单等静态链接
- ✅ 用户可以直接点击的链接

### 何时使用 useRouter

- ✅ 命令式导航
- ✅ 基于事件触发的导航（按钮点击、表单提交等）
- ✅ 需要条件判断的导航
- ✅ 需要刷新当前页面
- ✅ 需要控制浏览器历史记录

### 何时使用 redirect

- ✅ 服务端重定向（认证、权限检查等）
- ✅ Server Actions 中的重定向
- ✅ 条件重定向（数据不存在、权限不足等）
- ✅ URL 迁移和 SEO 优化

### 选择建议表格

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 导航栏链接 | `Link` | 声明式、自动预取 |
| 按钮点击导航 | `useRouter.push` | 命令式、灵活 |
| 登录后重定向 | `redirect`（服务端） | 服务端逻辑 |
| 表单提交后跳转 | `redirect`（Server Action） | 服务端处理 |
| 条件重定向 | `redirect`（服务端组件） | 服务端判断 |
| 刷新当前页面 | `useRouter.refresh` | 客户端操作 |
| 返回上一页 | `useRouter.back` | 浏览器历史 |
| 替换当前路由 | `Link` 的 `replace` 或 `useRouter.replace` | 避免历史记录堆积 |

## 代码示例

### Link 组件的各种用法

```tsx
import Link from 'next/link'

export default function LinkExamples() {
  return (
    <div>
      {/* 基础链接 */}
      <Link href="/about">关于我们</Link>
      
      {/* 禁用预取 */}
      <Link href="/heavy-page" prefetch={false}>
        重型页面
      </Link>
      
      {/* 保持滚动位置 */}
      <Link href="/long-content" scroll={false}>
        长内容页面
      </Link>
      
      {/* 替换历史记录 */}
      <Link href="/login-success" replace>
        登录成功
      </Link>
      
      {/* 动态路由 */}
      <Link href={`/products/${productId}`}>
        产品详情
      </Link>
      
      {/* 查询参数 */}
      <Link href="/search?q=nextjs&page=1">
        搜索结果
      </Link>
      
      {/* 组合使用 */}
      <Link
        href="/dashboard"
        prefetch={true}
        scroll={false}
        replace={false}
      >
        仪表板
      </Link>
    </div>
  )
}
```

### useRouter 的各种方法

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RouterExamples() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <div>
      {/* push - 导航到新路由 */}
      <button onClick={() => router.push('/dashboard')}>
        前往仪表板
      </button>
      
      {/* push with options */}
      <button onClick={() => router.push('/dashboard', { scroll: false })}>
        不滚动导航
      </button>
      
      {/* replace - 替换当前路由 */}
      <button onClick={() => router.replace('/home')}>
        替换为首页
      </button>
      
      {/* refresh - 刷新当前路由 */}
      <button onClick={() => router.refresh()}>
        刷新页面
      </button>
      
      {/* back - 返回上一页 */}
      <button onClick={() => router.back()}>
        返回
      </button>
      
      {/* forward - 前进到下一页 */}
      <button onClick={() => router.forward()}>
        前进
      </button>
      
      {/* prefetch - 手动预取 */}
      <button
        onMouseEnter={() => router.prefetch('/dashboard')}
        onClick={() => router.push('/dashboard')}
      >
        悬停预取
      </button>
      
      {/* 动态路由 */}
      <button onClick={() => router.push(`/products/${productId}`)}>
        查看产品
      </button>
      
      {/* 查询参数 */}
      <button
        onClick={() => {
          router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }}
      >
        搜索
      </button>
    </div>
  )
}
```

### redirect 在不同场景下的使用

```tsx
// 1. 服务端组件中的重定向
import { redirect } from 'next/navigation'

async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)
  
  if (!user) {
    redirect('/404')
  }
  
  if (!user.isVerified) {
    redirect('/verify-email')
  }
  
  return <div>用户资料：{user.name}</div>
}

// 2. Server Action 中的重定向
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // 创建文章
  const post = await savePost({ title, content })
  
  // 重新验证缓存
  revalidatePath('/posts')
  
  // 重定向到新文章（默认 push）
  redirect(`/posts/${post.id}`)
}

// 3. 客户端组件中的重定向
'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ isAuthenticated, children }) {
  useEffect(() => {
    if (!isAuthenticated) {
      redirect('/login') // 默认 replace
    }
  }, [isAuthenticated])
  
  if (!isAuthenticated) {
    return null
  }
  
  return <>{children}</>
}

// 4. 中间件中的重定向
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 永久重定向示例
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.redirect(
      new URL('/new-path', request.url),
      { status: 308 }
    )
  }
  
  return NextResponse.next()
}
```

### 组合使用示例

```tsx
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useState } from 'react'

export default function AdvancedNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )
  
  const handleSearch = async (query: string) => {
    setIsLoading(true)
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsLoading(false)
  }
  
  const currentPage = parseInt(searchParams.get('page') || '1')
  
  return (
    <div>
      {/* 使用 Link 的导航 */}
      <nav>
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          首页
        </Link>
        <Link href="/about">关于</Link>
        <Link href="/products" prefetch={false}>
          产品
        </Link>
      </nav>
      
      {/* 使用 useRouter 的搜索 */}
      <div>
        <input
          type="text"
          placeholder="搜索..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e.currentTarget.value)
            }
          }}
        />
        {isLoading && <span>加载中...</span>}
      </div>
      
      {/* 分页导航 */}
      <div>
        <button
          onClick={() => {
            router.push(pathname + '?' + createQueryString('page', String(currentPage - 1)))
          }}
          disabled={currentPage === 1}
        >
          上一页
        </button>
        
        <span>第 {currentPage} 页</span>
        
        <Link
          href={pathname + '?' + createQueryString('page', String(currentPage + 1))}
        >
          下一页
        </Link>
      </div>
      
      {/* 刷新按钮 */}
      <button onClick={() => router.refresh()}>
        刷新数据
      </button>
    </div>
  )
}
```

## 最佳实践

### 性能优化建议

1. **合理使用预取**
   - 对于重要页面，保持默认预取
   - 对于重型页面或大量链接，禁用预取
   - 使用悬停预取优化用户体验

```tsx
// 好的做法：重要页面启用预取
<Link href="/dashboard">仪表板</Link>

// 好的做法：大量链接禁用预取
{products.map(product => (
  <Link key={product.id} href={`/products/${product.id}`} prefetch={false}>
    {product.name}
  </Link>
))}
```

2. **避免不必要的重定向**
   - 在客户端避免使用 `redirect`，优先使用 `useRouter`
   - 服务端重定向应该在数据获取阶段完成

```tsx
// 好的做法：服务端重定向
async function Page() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login') // 在服务端完成
  }
  return <div>内容</div>
}

// 不好的做法：客户端重定向
'use client'
function Page() {
  useEffect(() => {
    if (!user) {
      redirect('/login') // 应该使用 router.push
    }
  }, [])
}
```

3. **使用 replace 避免历史记录堆积**
   - 登录后重定向使用 `replace`
   - 表单提交后跳转考虑使用 `replace`

```tsx
// 好的做法：登录后替换历史记录
router.replace('/dashboard') // 用户无法返回登录页

// 不好的做法：添加历史记录
router.push('/dashboard') // 用户可以通过后退返回登录页
```

### 用户体验建议

1. **提供加载状态**
   - 在导航过程中显示加载指示器
   - 使用 `loading.tsx` 文件自动处理

2. **保持滚动位置**
   - 对于长列表页面，使用 `scroll={false}` 保持滚动位置
   - 对于新页面，默认滚动到顶部

3. **错误处理**
   - 使用 `error.tsx` 处理导航错误
   - 提供重试机制

### 常见错误和避免方法

1. **错误：在服务端组件中使用 useRouter**
   ```tsx
   // 错误
   import { useRouter } from 'next/navigation'
   
   export default function Page() {
     const router = useRouter() // 错误：服务端组件不能使用 Hook
     return <div>内容</div>
   }
   
   // 正确：使用 redirect
   import { redirect } from 'next/navigation'
   
   export default function Page() {
     redirect('/dashboard') // 正确：服务端重定向
   }
   ```

2. **错误：从错误的包导入 useRouter**
   ```tsx
   // 错误：Pages Router 的导入方式
   import { useRouter } from 'next/router'
   
   // 正确：App Router 的导入方式
   import { useRouter } from 'next/navigation'
   ```

3. **错误：在中间件中使用 redirect 函数**
   ```tsx
   // 错误
   import { redirect } from 'next/navigation'
   
   export function middleware(request) {
     redirect('/login') // 错误：中间件中不能使用
   }
   
   // 正确：使用 NextResponse.redirect
   import { NextResponse } from 'next/server'
   
   export function middleware(request) {
     return NextResponse.redirect(new URL('/login', request.url))
   }
   ```

## 常见问题

### Q: Link 组件和原生 a 标签有什么区别？

A: Link 组件提供了以下增强功能：
- 自动预取目标路由
- 客户端导航（不刷新页面）
- 保持滚动位置
- 代码分割和优化
- 与 Next.js 路由系统集成

### Q: 什么时候应该禁用 prefetch？

A: 在以下情况下应该禁用 prefetch：
- 链接数量很多（如产品列表）
- 目标页面很重（包含大量数据）
- 用户不太可能点击的链接
- 需要减少服务器负载

### Q: useRouter 可以在服务端组件中使用吗？

A: 不可以。`useRouter` 是客户端 Hook，只能在客户端组件（使用 `'use client'`）中使用。在服务端组件中应该使用 `redirect` 函数。

### Q: redirect 和 useRouter.push 有什么区别？

A: 
- `redirect` 可以在服务端和客户端使用，主要用于服务端重定向
- `useRouter.push` 只能在客户端使用，用于命令式导航
- `redirect` 会抛出错误来中断执行，`useRouter.push` 是普通函数调用

### Q: 如何实现条件导航？

A: 可以使用以下方式：
- 服务端：使用 `redirect` 在数据获取后重定向
- 客户端：使用 `useRouter` 在事件处理函数中导航

### Q: 307 和 308 状态码有什么区别？

A:
- **307（临时重定向）**：告诉浏览器和搜索引擎这是临时重定向，原 URL 仍然有效
- **308（永久重定向）**：告诉浏览器和搜索引擎这是永久重定向，原 URL 不再使用，搜索引擎会更新索引

### Q: type 参数在什么情况下有效？

A: `type` 参数仅在以下场景中生效：
- 客户端组件中使用 `redirect`
- Server Actions 中使用 `redirect`
- 在服务端组件中无效

### Q: 如何实现外部链接导航？

A: 对于外部链接，可以直接使用原生 `<a>` 标签，或者使用 `Link` 组件（Next.js 会自动处理）：

```tsx
// 方式 1：使用原生 a 标签
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  外部链接
</a>

// 方式 2：使用 Link（Next.js 会自动处理）
<Link href="https://example.com">外部链接</Link>
```

### Q: 如何在导航时传递数据？

A: Next.js 推荐通过以下方式传递数据：
- URL 参数：`/products/[id]`
- 查询参数：`/search?q=nextjs`
- Server Actions：通过表单提交
- 状态管理：使用 Context、Zustand 等状态管理库

## 参考链接

- [Next.js 路由导航官方文档](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Next.js Link 组件 API](https://nextjs.org/docs/app/api-reference/components/link)
- [Next.js useRouter Hook](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Next.js redirect 函数](https://nextjs.org/docs/app/api-reference/functions/redirect)
- [Next.js 中间件文档](https://nextjs.org/docs/app/building-your-application/routing/middleware)

