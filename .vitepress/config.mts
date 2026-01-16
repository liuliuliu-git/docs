import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "技术文档",
  description: "涵盖 React、Next.js、Node.js、Go 等技术栈的学习指南和参考文档",
  base: '/',

    // Mermaid 配置
    mermaid: {
      // 使用较轻量的主题
      theme: 'default',
    },

  // Vite 配置优化
  vite: {
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        '@braintree/sanitize-url',
        'mermaid',
        'vue'
      ],
      esbuildOptions: {
        target: 'esnext',
        mainFields: ['module', 'main'],
        format: 'esm'
      }
    },
    // 缓存配置
    cacheDir: '.vitepress/cache',
    // 构建优化
    build: {
      // 代码分割
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
      // 使用 esbuild 压缩，兼容性好
      minify: 'esbuild',
      // 禁用 sourcemap 减少构建体积
      sourcemap: false
    },
    // 开发服务器优化
    server: {
      hmr: {
        overlay: true
      },
      warmup: {
        clientFiles: [
          './.vitepress/theme/index.ts',
          './.vitepress/theme/style.css'
        ]
      }
    },
    resolve: {
      dedupe: ['@braintree/sanitize-url', 'vue']
    }
  },

    themeConfig: {
      // 导航栏
      nav: [
        { text: '首页', link: '/' },
        { text: '学习指南', link: '/guides/' },
        { text: 'API 参考', link: '/api/' },
        { text: '最佳实践', link: '/best-practices/' },
        { text: '示例', link: '/examples/' }
      ],

      // 侧边栏
      sidebar: {
        '/guides/': [
          {
            text: '学习指南',
            items: [
              { text: '指南首页', link: '/guides/' }
            ]
          },
          {
            text: '前端通用知识',
            items: [
              { text: '前端渲染模式：CSR、SSR、SSG', link: '/guides/general/rendering-modes' },
              { text: '网络与通信：HTTP、缓存、HTTPS', link: '/guides/general/network-communication' },
              { text: '认证机制：Cookie、Token、Session', link: '/guides/general/authentication' }
            ]
          },
          {
            text: 'React',
            items: [
              { text: 'React 指南', link: '/guides/react/' },
              { text: 'Hooks 概览', link: '/guides/react/hooks/' },
              { text: 'use() API', link: '/guides/react/use-api' },
              {
                text: '核心 Hooks',
                collapsed: true,
                items: [
                  { text: 'useState', link: '/guides/react/hooks/useState' },
                  { text: 'useReducer', link: '/guides/react/hooks/useReducer' },
                  { text: 'useEffect', link: '/guides/react/hooks/useEffect' },
                  { text: 'useRef', link: '/guides/react/hooks/useRef' },
                  { text: 'useCallback/useMemo', link: '/guides/react/hooks/useCallback-useMemo' },
                  { text: '自定义 Hooks', link: '/guides/react/hooks/custom-hooks' }
                ]
              }
            ]
          },
          {
            text: 'Next.js',
            items: [
              { text: 'Next.js 指南', link: '/guides/nextjs/' },
              { text: 'App Router 文件路由系统', link: '/guides/nextjs/app-router' },
              { text: 'App Router 路由导航', link: '/guides/nextjs/navigation' },
              { text: '路由组', link: '/guides/nextjs/route-groups' },
              { text: '服务端路由处理程序', link: '/guides/nextjs/router-handle' },
              { text: 'Proxy（代理）', link: '/guides/nextjs/proxy' },
              {
                text: '进阶主题',
                collapsed: true,
                items: [
                  { text: '数据获取', link: '/guides/nextjs/data-fetching' },
                  { text: '缓存机制', link: '/guides/nextjs/caching' },
                  { text: 'Middleware', link: '/guides/nextjs/middleware' },
                  { text: '错误处理', link: '/guides/nextjs/error-handling' }
                ]
              }
            ]
          },
          {
            text: 'Node.js',
            items: [
              { text: 'Node.js 指南', link: '/guides/nodejs/' }
            ]
          },
          {
            text: 'Go',
            items: [
              { text: 'Go 指南', link: '/guides/go/' }
            ]
          }
        ],
        '/api/': [
          {
            text: 'API 参考',
            items: [
              { text: 'API 首页', link: '/api/' }
            ]
          },
          {
            text: 'React',
            items: [
              { text: 'React API', link: '/api/react/' }
            ]
          },
          {
            text: 'Node.js',
            items: [
              { text: 'Node.js API', link: '/api/nodejs/' }
            ]
          }
        ],
        '/best-practices/': [
          {
            text: '最佳实践',
            items: [
              { text: '最佳实践首页', link: '/best-practices/' }
            ]
          },
          {
            text: 'React',
            items: [
              { text: 'React 最佳实践', link: '/best-practices/react/' }
            ]
          },
          {
            text: 'Node.js',
            items: [
              { text: 'Node.js 最佳实践', link: '/best-practices/nodejs/' }
            ]
          }
        ],
        '/examples/': [
          {
            text: '示例',
            items: [
              { text: '示例首页', link: '/examples/' },
              { text: 'Markdown 示例', link: '/examples/markdown-examples' },
              { text: 'API 示例', link: '/examples/api-examples' }
            ]
          }
        ],
        '/meta/': [
          {
            text: '元文档',
            items: [
              { text: '元文档首页', link: '/meta/' },
              { text: 'AI 编写指南', link: '/meta/ai-writing-guide' }
            ]
          }
        ]
      },

      // 启用 Outline（文档大纲）
      outline: {
        level: [2, 3],
        label: '目录'
      },

      // 社交链接
      socialLinks: [
        { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
      ],

      // 搜索配置
      search: {
        provider: 'local'
      }
    }
  })
)
