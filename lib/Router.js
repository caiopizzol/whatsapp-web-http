// Router.js - Simple Router Implementation

export class Router {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
  }

  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }

  addRoute(method, path, handler) {
    const key = `${method} ${path}`;
    this.routes.set(key, { path, handler, regex: this.pathToRegex(path) });
  }

  pathToRegex(path) {
    const pattern = path.replace(/\/:([^/]+)/g, '/(?<$1>[^/]+)').replace(/\//g, '/');
    return new RegExp(`^${pattern}$`);
  }

  async handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Find matching route
    let route = null;
    let params = {};

    for (const [key, value] of this.routes) {
      if (key.startsWith(req.method)) {
        const match = path.match(value.regex);
        if (match) {
          route = value;
          params = match.groups || {};
          break;
        }
      }
    }

    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    // Parse body for POST/PUT
    if (['POST', 'PUT'].includes(req.method)) {
      req.body = await this.parseBody(req);
    }

    req.params = params;
    req.query = Object.fromEntries(url.searchParams);

    // Apply middleware
    for (const middleware of this.middleware) {
      await new Promise((resolve) => {
        middleware(req, res, resolve);
      });
      if (res.headersSent) {
        return;
      }
    }

    // Execute handler
    await route.handler(req, res);
  }

  async parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
      req.on('error', reject);
    });
  }
}
