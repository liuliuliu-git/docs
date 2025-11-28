import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: "技术文档",
    description: "涵盖 React、Next.js、Node.js、Go 等技术栈的学习指南和参考文档",
    base: '/', // 部署路径：根路径部署设置为 '/'，子路径部署设置为 '/仓库名/'
    
    // Mermaid 配置（可选）
    mermaid: {
      // 可以在这里配置 Mermaid 的选项
      // 例如：theme: 'default' | 'dark' | 'forest' | 'neutral'
    },
    
    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '学习指南', link: '/guides/' },
      { text: 'API 参考', link: '/api/' },
      { text: '最佳实践', link: '/best-practices/' },
      { text: '示例', link: '/examples/' }
    ],

    sidebar: {
      '/guides/': [
        {
          text: '学习指南',
          items: [
            { text: '指南首页', link: '/guides/' }
          ]
        },
        {
          text: 'React',
          items: [
            { text: 'React 指南', link: '/guides/react/' },
            { text: 'use() API', link: '/guides/react/use-api' }
          ]
        },
        {
          text: 'Next.js',
          items: [
            { text: 'Next.js 指南', link: '/guides/nextjs/' },
            { text: 'App Router 文件路由系统', link: '/guides/nextjs/app-router' },
            { text: 'App Router 路由导航', link: '/guides/nextjs/navigation' }
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
    }
  })
)
