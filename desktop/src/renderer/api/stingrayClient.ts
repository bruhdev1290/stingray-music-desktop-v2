export interface StingrayAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export class StingrayClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async ping(): Promise<boolean> {
    const url = `${this.baseUrl}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { method: 'GET', signal: controller.signal });
      return response.ok;
    } finally {
      clearTimeout(timeout);
    }
  }

  async login(username: string, password: string): Promise<StingrayAuthTokens> {
    const url = `${this.baseUrl}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error(`Auth failed with status ${response.status}`);
    }

    return (await response.json()) as StingrayAuthTokens;
  }
}
