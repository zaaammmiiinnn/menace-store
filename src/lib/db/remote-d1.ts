import fs from 'fs';
import path from 'path';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '8f78928c8bccafddd28a0c8f2ffb95d4';
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '5208d6ac-b7b7-41d2-bcd6-2a7a4962c8b0';
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || 'ab2dd890e2774b26a4b088482abeceef';

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

function readWranglerConfig(): { token: string | null; refreshToken: string | null; expiry: number } {
  try {
    const tomlPath = path.join(process.env.HOME || '', 'Library/Preferences/.wrangler/config/default.toml');
    if (!fs.existsSync(tomlPath)) {
      return { token: null, refreshToken: null, expiry: 0 };
    }
    const content = fs.readFileSync(tomlPath, 'utf8');
    const tokenMatch = content.match(/oauth_token\s*=\s*"([^"]+)"/);
    const refreshMatch = content.match(/refresh_token\s*=\s*"([^"]+)"/);
    const expiryMatch = content.match(/expiration_time\s*=\s*"([^"]+)"/);

    const token = tokenMatch ? tokenMatch[1] : null;
    const refreshToken = refreshMatch ? refreshMatch[1] : null;
    const expiry = expiryMatch ? new Date(expiryMatch[1]).getTime() : 0;

    return { token, refreshToken, expiry };
  } catch {
    return { token: null, refreshToken: null, expiry: 0 };
  }
}

async function refreshWranglerToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://dash.cloudflare.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: '54d11594-84e4-41aa-b438-e81b8fa78ee7',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data.access_token) return null;

    const tomlPath = path.join(process.env.HOME || '', 'Library/Preferences/.wrangler/config/default.toml');
    const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
    const updatedContent = [
      `oauth_token = "${data.access_token}"`,
      `expiration_time = "${newExpiry}"`,
      `refresh_token = "${data.refresh_token || refreshToken}"`,
      `scopes = [ "user:read", "offline_access", "k2.read", "k2.write", "account:read", "workers:write", "workers_kv:write", "workers_routes:write", "workers_scripts:write", "workers_tail:read", "d1:write", "pages:write", "zone:read", "ssl_certs:write", "ai:write", "ai-search:write", "ai-search:run", "agent-memory:write", "queues:write", "pipelines:write", "secrets_store:write", "artifacts:write", "flagship:write", "containers:write", "cloudchamber:write", "connectivity:admin", "email_routing:write", "email_sending:write", "browser:write", "challenge-widgets.write" ]`,
    ].join('\n');

    fs.writeFileSync(tomlPath, updatedContent, 'utf8');
    cachedToken = data.access_token;
    tokenExpiryTime = Date.now() + (data.expires_in || 3600) * 1000;
    return data.access_token;
  } catch {
    return null;
  }
}

export async function getCloudflareAuthToken(): Promise<string | null> {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }

  if (cachedToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedToken;
  }

  const { token, refreshToken, expiry } = readWranglerConfig();

  if (token && expiry > Date.now() + 60000) {
    cachedToken = token;
    tokenExpiryTime = expiry;
    return token;
  }

  if (refreshToken) {
    const refreshed = await refreshWranglerToken(refreshToken);
    if (refreshed) return refreshed;
  }

  return token || null;
}

export class RemoteD1Database {
  private accountId: string;
  private databaseId: string;

  constructor(accountId = CLOUDFLARE_ACCOUNT_ID, databaseId = CLOUDFLARE_D1_DATABASE_ID) {
    this.accountId = accountId;
    this.databaseId = databaseId;
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<{ results: any[]; success: boolean; meta: any }> {
    const token = await getCloudflareAuthToken();
    if (!token) {
      throw new Error('Cloudflare authentication token not found. Please set CLOUDFLARE_API_TOKEN or run wrangler login.');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;

    let res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (res.status === 401) {
      const { refreshToken } = readWranglerConfig();
      if (refreshToken) {
        const freshToken = await refreshWranglerToken(refreshToken);
        if (freshToken) {
          res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${freshToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql, params }),
          });
        }
      }
    }

    const data: any = await res.json();
    if (!data.success) {
      const errMsg = data.errors?.[0]?.message || 'Cloudflare D1 query failed';
      throw new Error(errMsg);
    }

    const queryResult = data.result?.[0] || {};
    return {
      results: queryResult.results || [],
      success: true,
      meta: queryResult.meta || {},
    };
  }

  prepare(query: string) {
    const self = this;
    let boundParams: any[] = [];

    return {
      bind(...params: any[]) {
        boundParams = params;
        return this;
      },
      async all() {
        return self.executeQuery(query, boundParams);
      },
      async run() {
        return self.executeQuery(query, boundParams);
      },
      async first(col?: string) {
        const res = await self.executeQuery(query, boundParams);
        const row = res.results?.[0];
        if (!row) return null;
        return col ? row[col] : row;
      },
      async raw() {
        const res = await self.executeQuery(query, boundParams);
        return (res.results || []).map((row) => Object.values(row));
      },
    };
  }

  async batch(statements: any[]) {
    const results = [];
    for (const stmt of statements) {
      results.push(await stmt.all());
    }
    return results;
  }

  async exec(query: string) {
    const token = await getCloudflareAuthToken();
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: query, params: [] }),
    });
    return { count: 1, duration: 1 };
  }
}

export class RemoteKVNamespace {
  private accountId: string;
  private namespaceId: string;

  constructor(accountId = CLOUDFLARE_ACCOUNT_ID, namespaceId = CLOUDFLARE_KV_NAMESPACE_ID) {
    this.accountId = accountId;
    this.namespaceId = namespaceId;
  }

  async get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' } | string): Promise<any> {
    const token = await getCloudflareAuthToken();
    if (!token) return null;

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404 || !res.ok) return null;

    const type = typeof options === 'string' ? options : options?.type || 'text';
    if (type === 'json') {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    if (type === 'arrayBuffer') {
      return await res.arrayBuffer();
    }
    return await res.text();
  }

  async put(key: string, value: any, options?: { expirationTtl?: number }): Promise<void> {
    const token = await getCloudflareAuthToken();
    if (!token) return;

    let url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`;
    if (options?.expirationTtl) {
      url += `?expiration_ttl=${options.expirationTtl}`;
    }

    const body = typeof value === 'string' ? value : JSON.stringify(value);
    await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body,
    });
  }

  async delete(key: string): Promise<void> {
    const token = await getCloudflareAuthToken();
    if (!token) return;

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`;
    await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

let globalRemoteD1: RemoteD1Database | null = null;
let globalRemoteKV: RemoteKVNamespace | null = null;

export function getRemoteD1Database(): RemoteD1Database | null {
  if (!globalRemoteD1) {
    globalRemoteD1 = new RemoteD1Database();
  }
  return globalRemoteD1;
}

export function getRemoteKVDatabase(): RemoteKVNamespace | null {
  if (!globalRemoteKV) {
    globalRemoteKV = new RemoteKVNamespace();
  }
  return globalRemoteKV;
}
