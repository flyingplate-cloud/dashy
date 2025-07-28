import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  let options = {}

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(event.request, url)
    }

    // Handle static assets
    const page = await getAssetFromKV(event, options)

    // Allow headers to be altered
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(event.request.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

async function handleApiRequest(request, url) {
  const path = url.pathname

  // Handle status check
  if (path === '/api/status') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: ENVIRONMENT || 'production'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Handle config operations
  if (path === '/api/config') {
    if (request.method === 'GET') {
      return await getConfig()
    } else if (request.method === 'POST') {
      return await saveConfig(request)
    }
  }

  // Handle CORS proxy
  if (path === '/api/cors') {
    return await handleCorsProxy(request)
  }

  // Handle health check
  if (path === '/api/health') {
    return new Response(JSON.stringify({ 
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Not Found', { status: 404 })
}

async function getConfig() {
  try {
    // Try to get config from KV storage
    let config = null
    
    if (typeof DASHY_CONFIG !== 'undefined') {
      try {
        const storedConfig = await DASHY_CONFIG.get('config', { type: 'json' })
        if (storedConfig) {
          config = storedConfig
        }
      } catch (error) {
        console.error('Failed to load config from KV:', error)
      }
    }

    // If no config in KV, return default config
    if (!config) {
      config = {
        pageInfo: {
          title: 'Dashy',
          description: 'Your self-hosted dashboard'
        },
        sections: [
          {
            name: 'Welcome',
            icon: 'fas fa-home',
            items: [
              {
                title: 'GitHub',
                description: 'Source code',
                icon: 'fab fa-github',
                url: 'https://github.com/Lissy93/dashy'
              },
              {
                title: 'Documentation',
                description: 'Dashy docs',
                icon: 'fas fa-book',
                url: 'https://dashy.to/docs'
              }
            ]
          }
        ],
        appConfig: {
          theme: 'dark',
          language: 'en',
          layout: 'auto',
          hideComponents: {
            header: false,
            footer: false,
            search: false,
            settings: false
          }
        }
      }
    }

    return new Response(JSON.stringify(config), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function saveConfig(request) {
  try {
    const config = await request.json()
    
    // Save to KV storage if available
    if (typeof DASHY_CONFIG !== 'undefined') {
      try {
        await DASHY_CONFIG.put('config', JSON.stringify(config))
      } catch (error) {
        console.error('Failed to save config to KV:', error)
        return new Response(JSON.stringify({ error: 'Failed to save config' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleCorsProxy(request) {
  try {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')
    
    if (!targetUrl) {
      return new Response('Missing URL parameter', { status: 400 })
    }

    // Validate URL
    let targetUrlObj
    try {
      targetUrlObj = new URL(targetUrl)
    } catch (error) {
      return new Response('Invalid URL', { status: 400 })
    }

    // Block certain protocols for security
    if (targetUrlObj.protocol !== 'http:' && targetUrlObj.protocol !== 'https:') {
      return new Response('Invalid protocol', { status: 400 })
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Dashy/1.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(([key]) => 
            !['host', 'origin', 'referer'].includes(key.toLowerCase())
          )
        )
      },
      body: request.method !== 'GET' ? await request.arrayBuffer() : undefined
    })

    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', '*')
    headers.set('X-Proxy-By', 'Dashy')

    return new Response(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    return new Response('Proxy error', { status: 500 })
  }
}