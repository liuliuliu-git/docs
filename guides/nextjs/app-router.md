---
outline: deep
---

# Next.js App Router 文件路由系统

## 概述

Next.js 13+ 引入了全新的 App Router，它基于 React Server Components 构建，采用基于文件系统的路由机制。与传统的 Pages Router 不同，App Router 使用特殊的文件约定来定义路由、布局、加载状态和错误处理，提供了更强大和灵活的路由组织方式。

### App Router 的核心特点

- **基于文件系统的路由**：通过 `app` 目录下的文件夹结构自动生成路由
- **嵌套布局**：支持嵌套的布局系统，实现共享 UI 和状态保持
- **服务端组件优先**：默认使用 React Server Components，提升性能
- **流式渲染**：支持渐进式渲染和 Suspense 集成
- **类型安全**：完整的 TypeScript 支持

### 与 Pages Router 的区别

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| 目录结构 | `pages/` | `app/` |
| 布局方式 | `_app.tsx` 全局布局 | 嵌套 `layout.tsx` |
| 数据获取 | `getServerSideProps`、`getStaticProps` | Server Components、`fetch` |
| 加载状态 | 手动实现 | `loading.tsx` 自动处理 |
| 错误处理 | 手动实现 | `error.tsx` 自动处理 |
| 路由组织 | 扁平结构 | 嵌套结构，支持路由组 |

::: tip 迁移建议
如果你正在使用 Pages Router，可以逐步迁移到 App Router。两个系统可以在同一个项目中并存，Pages Router 的 `pages/` 目录和 App Router 的 `app/` 目录可以同时存在。
:::

## 核心文件约定

App Router 通过特殊的文件命名约定来定义路由和页面行为。这些文件必须放在 `app` 目录下，每个文件都有特定的用途。

### page.tsx

`page.tsx` 是**必需**的文件，用于创建可访问的路由。只有包含 `page.tsx` 的文件夹才会成为路由段。

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是关于页面</p>
    </div>
  )
}
```

访问路径：`/about`

::: warning 重要提示
仅创建文件夹不会自动生成路由，必须包含 `page.tsx` 文件。例如，`app/products/` 文件夹如果没有 `page.tsx`，不会创建 `/products` 路由。
:::

### layout.tsx

`layout.tsx` 是**可选**的布局文件，用于定义共享的 UI 结构。布局文件会包裹其目录下的所有页面和子路由。

```tsx
// app/layout.tsx (根布局)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header>网站头部</header>
        <main>{children}</main>
        <footer>网站底部</footer>
      </body>
    </html>
  )
}
```

```tsx
// app/dashboard/layout.tsx (嵌套布局)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav>仪表板导航</nav>
      <section>{children}</section>
    </div>
  )
}
```

::: tip 根布局
虽然根布局不是"必然存在"，但**强烈建议**创建 `app/layout.tsx`。如果没有根布局，Next.js 会使用默认布局，但你可能无法自定义 HTML 结构、元数据等。
:::

**布局的特点：**
- 在路由切换时**保持状态**（组件不会重新挂载）
- 可以嵌套，子布局包裹在父布局中
- 支持共享数据和状态管理

### template.tsx

`template.tsx` 是**可选**的模板文件，功能与 `layout.tsx` 类似，但有一个关键区别：**每次导航都会重新渲染**。

```tsx
// app/dashboard/template.tsx
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-template">
      <div className="animation-wrapper">
        {children}
      </div>
    </div>
  )
}
```

**Template 的特点：**
- 每次路由切换都会**重新渲染**（组件会重新挂载）
- 适合需要动画效果或重置状态的场景
- 不能保持状态

### loading.tsx

`loading.tsx` 是**可选**的加载状态文件，用于在页面或布局加载时显示加载 UI。底层通过 React Suspense 实现。

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading-spinner">
      <div>加载中...</div>
    </div>
  )
}
```

**Loading 的工作原理：**
- 当页面组件使用 `async/await` 或 Suspense 时自动触发
- 显示在最近的 `loading.tsx` 位置
- 支持嵌套，子路由的 loading 会覆盖父路由的 loading

```tsx
// app/dashboard/page.tsx
async function DashboardPage() {
  // 这个异步操作会触发 loading.tsx
  const data = await fetchData()
  return <div>{data}</div>
}
```

### error.tsx

`error.tsx` 是**可选**的错误边界文件，用于捕获和处理路由中的错误。底层借助 React Error Boundary 实现。

```tsx
// app/dashboard/error.tsx
'use client' // Error Boundary 必须是客户端组件

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

**Error 的特点：**
- 必须是客户端组件（使用 `'use client'` 指令）
- 只捕获其目录及子目录中的错误
- 提供 `error` 对象和 `reset` 函数
- 不会捕获根布局的错误（需要在根布局外创建 error.tsx）

### not-found.tsx

`not-found.tsx` 是**可选**的 404 页面文件，用于自定义未找到页面的显示。这不是 Next.js 默认生成的，而是你可以创建来覆盖默认的 404 页面。

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - 页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
    </div>
  )
}
```

```tsx
// app/dashboard/not-found.tsx (特定路由的 404)
export default function DashboardNotFound() {
  return (
    <div>
      <h2>仪表板页面未找到</h2>
    </div>
  )
}
```

**使用 notFound() 函数：**

```tsx
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  
  if (!product) {
    notFound() // 触发最近的 not-found.tsx
  }
  
  return <div>{product.name}</div>
}
```

### route.ts

`route.ts` 是**可选**的 API 路由处理程序，用于创建 API 端点。

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await fetchUsers()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await createUser(body)
  return NextResponse.json(user, { status: 201 })
}
```

> 📖 **详细文档**：查看 [服务端路由处理程序完整指南](/guides/nextjs/router-handle) 了解更多内容，包括 HTTP 方法、动态路由参数、请求响应处理等。

## 文件执行顺序

当 Layout 和 Template 同时存在时，执行顺序是：**Layout → Template → Page**

### 执行流程示例

假设有以下文件结构：

```
app/
├── layout.tsx          (根布局)
├── template.tsx        (根模板)
├── page.tsx           (首页)
└── dashboard/
    ├── layout.tsx     (仪表板布局)
    ├── template.tsx   (仪表板模板)
    └── page.tsx       (仪表板页面)
```

访问 `/dashboard` 时的渲染顺序：

1. **app/layout.tsx** - 根布局渲染
2. **app/template.tsx** - 根模板渲染（重新挂载）
3. **app/dashboard/layout.tsx** - 仪表板布局渲染
4. **app/dashboard/template.tsx** - 仪表板模板渲染（重新挂载）
5. **app/dashboard/page.tsx** - 仪表板页面渲染

### 嵌套布局的执行顺序

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  console.log('1. Root Layout')
  return (
    <html>
      <body>
        <div>Root Layout</div>
        {children}
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  console.log('2. Dashboard Layout')
  return (
    <div>
      <nav>Dashboard Nav</nav>
      {children}
    </div>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  console.log('3. Dashboard Page')
  return <div>Dashboard Content</div>
}
```

输出顺序：
```
1. Root Layout
2. Dashboard Layout
3. Dashboard Page
```

## 状态管理差异

### Layout 的状态保持

Layout 组件在路由切换时**不会重新挂载**，因此可以保持状态。

```tsx
// app/dashboard/layout.tsx
'use client'

import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [count, setCount] = useState(0)
  
  // 这个状态在路由切换时会保持
  return (
    <div>
      <nav>
        <button onClick={() => setCount(count + 1)}>
          点击次数: {count}
        </button>
      </nav>
      {children}
    </div>
  )
}
```

**适用场景：**
- 导航栏、侧边栏等需要保持状态的 UI
- 用户输入表单（在切换页面时保持输入）
- 主题切换、语言切换等全局状态

### Template 的重新渲染

Template 组件在每次路由切换时都会**重新挂载**，状态会重置。

```tsx
// app/dashboard/template.tsx
'use client'

import { useState, useEffect } from 'react'

export default function DashboardTemplate({ children }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    console.log('Template mounted') // 每次路由切换都会执行
  }, [])
  
  return (
    <div className={mounted ? 'fade-in' : ''}>
      {children}
    </div>
  )
}
```

**适用场景：**
- 页面切换动画效果
- 需要重置状态的场景
- 进入/离开页面的过渡效果

### 选择建议

| 场景 | 使用 Layout | 使用 Template |
|------|------------|--------------|
| 导航栏、侧边栏 | ✅ | ❌ |
| 保持用户输入 | ✅ | ❌ |
| 页面切换动画 | ❌ | ✅ |
| 重置表单状态 | ❌ | ✅ |
| 共享 UI 结构 | ✅ | ✅ |

::: tip 最佳实践
大多数情况下使用 `layout.tsx`。只有在需要每次导航都重新渲染的特殊场景下才使用 `template.tsx`。
:::

## 特殊文件实现原理

### loading.tsx 与 React Suspense

`loading.tsx` 底层通过 React Suspense 实现。当组件使用异步操作时，Suspense 会自动捕获并显示 loading UI。

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>加载中...</div>
}

// app/dashboard/page.tsx
async function DashboardPage() {
  // 这个异步操作会触发 Suspense
  const data = await fetch('/api/data').then(res => res.json())
  return <div>{data.message}</div>
}
```

**工作流程：**
1. 页面组件开始异步操作
2. React 抛出 Promise（Suspense 机制）
3. 最近的 `loading.tsx` 被渲染
4. 异步操作完成后，页面组件重新渲染

### error.tsx 与 Error Boundary

`error.tsx` 借助 React Error Boundary 实现错误捕获。

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({ error, reset }) {
  // Error Boundary 捕获的错误
  return (
    <div>
      <h2>错误: {error.message}</h2>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

**错误边界的特点：**
- 只捕获其子组件树中的错误
- 不捕获事件处理器、异步代码、服务端组件中的错误
- 提供 `reset()` 函数来重置错误状态

### not-found.tsx 的使用

`not-found.tsx` 可以通过 `notFound()` 函数手动触发。

```tsx
// app/products/[id]/page.tsx
import { notFound } from 'next/navigation'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound() // 触发最近的 not-found.tsx
  }
  
  return <div>{product.name}</div>
}
```

## 路由组织

### 文件夹结构与路由映射

App Router 通过文件夹结构自动生成路由：

```
app/
├── page.tsx                    → /
├── about/
│   └── page.tsx                → /about
├── products/
│   ├── page.tsx                → /products
│   └── [id]/
│       └── page.tsx            → /products/[id]
└── blog/
    ├── page.tsx                → /blog
    └── [...slug]/
        └── page.tsx            → /blog/[...slug]
```

### 路由组（Route Groups）

使用括号 `(folderName)` 创建路由组，这些文件夹**不会**成为 URL 的一部分，仅用于组织代码。

> 📖 **详细文档**：查看 [路由组完整指南](/guides/nextjs/route-groups) 了解更多内容。

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx            → /about
│   └── contact/
│       └── page.tsx            → /contact
└── (shop)/
    ├── products/
    │   └── page.tsx            → /products
    └── cart/
        └── page.tsx            → /cart
```

**路由组的用途：**
- 为不同的路由组创建不同的布局
- 组织相关的路由文件
- 不影响 URL 结构

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing-theme">
      {children}
    </div>
  )
}

// app/(shop)/layout.tsx
export default function ShopLayout({ children }) {
  return (
    <div className="shop-theme">
      {children}
    </div>
  )
}
```

### 动态路由

使用方括号创建动态路由段：

#### 单个参数 `[param]`

```tsx
// app/products/[id]/page.tsx
export default function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  return <div>产品 ID: {params.id}</div>
}
```

访问 `/products/123` → `params.id = "123"`

#### 多个参数 `[...slug]`

```tsx
// app/docs/[...slug]/page.tsx
export default function DocsPage({
  params,
}: {
  params: { slug: string[] }
}) {
  return <div>文档路径: {params.slug.join('/')}</div>
}
```

访问 `/docs/getting-started/installation` → `params.slug = ["getting-started", "installation"]`

#### 可选捕获 `[[...slug]]`

```tsx
// app/shop/[[...slug]]/page.tsx
export default function ShopPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  if (!params.slug) {
    return <div>商店首页</div>
  }
  return <div>商店路径: {params.slug.join('/')}</div>
}
```

访问 `/shop` → `params.slug = undefined`
访问 `/shop/category/electronics` → `params.slug = ["category", "electronics"]`

### 并行路由（Parallel Routes）

使用 `@folder` 命名约定创建并行路由，允许同时渲染多个页面。

```
app/
├── layout.tsx
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
└── dashboard/
    └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      {children}
      {analytics}
      {team}
    </div>
  )
}
```

### 拦截路由（Intercepting Routes）

使用特殊命名约定来拦截路由：

- `(.)` - 拦截同层级路由
- `(..)` - 拦截上一层级路由
- `(..)(..)` - 拦截上两层路由
- `(...)` - 拦截根目录下的所有路由

```
app/
├── @modal/
│   └── (.)photos/
│       └── [id]/
│           └── page.tsx        → 拦截 /photos/[id]
└── photos/
    └── [id]/
        └── page.tsx            → /photos/[id]
```

## 代码示例

### 基础文件结构示例

```tsx
// app/layout.tsx - 根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>我的网站</title>
      </head>
      <body>
        <header>
          <nav>导航栏</nav>
        </header>
        <main>{children}</main>
        <footer>页脚</footer>
      </body>
    </html>
  )
}

// app/page.tsx - 首页
export default function HomePage() {
  return (
    <div>
      <h1>欢迎</h1>
      <p>这是首页</p>
    </div>
  )
}

// app/about/page.tsx - 关于页面
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是关于页面</p>
    </div>
  )
}
```

### 嵌套布局示例

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <a href="/dashboard">概览</a>
          <a href="/dashboard/settings">设置</a>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>仪表板内容</div>
}

// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <div>设置页面</div>
}
```

### Layout vs Template 对比示例

```tsx
// app/dashboard/layout.tsx - 保持状态
'use client'

import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // 这个状态在路由切换时会保持
  return (
    <div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '收起' : '展开'}侧边栏
      </button>
      {sidebarOpen && <aside>侧边栏内容</aside>}
      <main>{children}</main>
    </div>
  )
}

// app/dashboard/template.tsx - 重新渲染
'use client'

import { useEffect, useState } from 'react'

export default function DashboardTemplate({ children }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // 每次路由切换都会执行
    console.log('Template mounted')
  }, [])
  
  return (
    <div className={mounted ? 'fade-in' : ''}>
      {children}
    </div>
  )
}
```

### Loading 和 Error 处理示例

```tsx
// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="loading">
      <div className="spinner">加载中...</div>
    </div>
  )
}

// app/products/error.tsx
'use client'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error">
      <h2>加载产品时出错</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}

// app/products/page.tsx
async function ProductsPage() {
  // 如果这个请求失败，会触发 error.tsx
  // 如果正在加载，会显示 loading.tsx
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json())
  
  return (
    <div>
      <h1>产品列表</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 最佳实践

### 何时使用 Layout vs Template

**使用 Layout 的场景：**
- 导航栏、侧边栏等需要保持状态的 UI
- 共享的头部、底部
- 需要保持用户输入的表单
- 主题切换、语言切换等全局状态

**使用 Template 的场景：**
- 页面切换动画效果
- 需要重置状态的场景
- 进入/离开页面的过渡效果
- 需要每次导航都重新初始化的组件

### 文件组织建议

1. **保持文件结构清晰**：使用路由组来组织相关的路由
2. **合理使用嵌套布局**：避免过深的嵌套层级
3. **统一错误处理**：在关键路由创建 error.tsx
4. **提供加载状态**：为异步页面创建 loading.tsx

### 性能优化建议

1. **使用 Server Components**：默认使用服务端组件，减少客户端 JavaScript
2. **合理使用 Loading**：为异步操作提供加载状态，提升用户体验
3. **错误边界粒度**：在合适的层级创建错误边界，避免整个应用崩溃
4. **代码分割**：Next.js 自动进行代码分割，每个路由都是独立的 chunk

::: tip 性能提示
App Router 默认使用 React Server Components，这意味着大部分组件在服务端渲染，减少了发送到客户端的 JavaScript 代码量，提升了性能。
:::

## 常见问题

### Q: 为什么我的文件夹没有生成路由？

A: 只有包含 `page.tsx` 的文件夹才会成为路由。仅创建文件夹不会自动生成路由。

### Q: Layout 和 Template 可以同时存在吗？

A: 可以。执行顺序是 Layout → Template → Page。Layout 保持状态，Template 每次重新渲染。

### Q: loading.tsx 什么时候会显示？

A: 当页面组件使用 `async/await` 或 Suspense 时，会自动显示最近的 `loading.tsx`。

### Q: error.tsx 必须使用 'use client' 吗？

A: 是的。Error Boundary 必须是客户端组件，因为错误边界是 React 的客户端特性。

### Q: 如何自定义 404 页面？

A: 在 `app` 目录下创建 `not-found.tsx` 文件，或使用 `notFound()` 函数触发特定路由的 404。

### Q: 路由组会影响 URL 吗？

A: 不会。使用括号命名的路由组（如 `(marketing)`）不会成为 URL 的一部分，仅用于组织代码。

### Q: 动态路由参数的类型是什么？

A: 所有路由参数都是字符串类型。如果需要数字，需要手动转换：`const id = parseInt(params.id)`。

### Q: 可以在同一个路由中同时使用 Layout 和 Template 吗？

A: 可以，但通常不需要。大多数情况下使用 Layout 就足够了。只有在需要每次导航都重新渲染的特殊场景下才使用 Template。

## 参考链接

- [Next.js App Router 官方文档](https://nextjs.org/docs/app)
- [Next.js 路由文档](https://nextjs.org/docs/app/building-your-application/routing)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

