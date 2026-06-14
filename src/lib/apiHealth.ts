export interface APIStatus {
  name: string;
  available: boolean;
  lastChecked: Date;
  responseTime?: number;
  message?: string;
}

export interface APIHealthState {
  printful: APIStatus;
  readyPlayerMe: APIStatus;
  metamarkerFit: APIStatus;
  gamewear: APIStatus;
  supabase: APIStatus;
}

const TIMEOUT_MS = 5000;

async function checkEndpoint(url: string, timeoutMs: number = TIMEOUT_MS): Promise<{ available: boolean; responseTime: number; message?: string }> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { available: true, responseTime };
    } else {
      return { available: false, responseTime, message: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    if (error.name === 'AbortError') {
      return { available: false, responseTime, message: 'Timeout' };
    }
    return { available: false, responseTime, message: error.message || 'Network error' };
  }
}

export class APIHealthMonitor {
  private static listeners: Array<(state: APIHealthState) => void> = [];
  private static currentState: APIHealthState | null = null;

  static subscribe(listener: (state: APIHealthState) => void): () => void {
    this.listeners.push(listener);
    if (this.currentState) {
      listener(this.currentState);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(state: APIHealthState) {
    this.currentState = state;
    this.listeners.forEach(listener => listener(state));
  }

  static async checkAllAPIs(): Promise<APIHealthState> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const checks = await Promise.allSettled([
      checkEndpoint(`${supabaseUrl}/functions/v1/printful-api/products`),
      checkEndpoint(`${supabaseUrl}/functions/v1/ready-player-me`),
      checkEndpoint(`${supabaseUrl}/functions/v1/metamarker-fit`),
      checkEndpoint(`${supabaseUrl}/functions/v1/gamewear-api`),
      checkEndpoint(`${supabaseUrl}/rest/v1/`),
    ]);

    const now = new Date();

    const state: APIHealthState = {
      printful: {
        name: 'Printful API',
        available: checks[0].status === 'fulfilled' && checks[0].value.available,
        lastChecked: now,
        responseTime: checks[0].status === 'fulfilled' ? checks[0].value.responseTime : undefined,
        message: checks[0].status === 'fulfilled' ? checks[0].value.message : 'Check failed',
      },
      readyPlayerMe: {
        name: 'Ready Player Me',
        available: checks[1].status === 'fulfilled' && checks[1].value.available,
        lastChecked: now,
        responseTime: checks[1].status === 'fulfilled' ? checks[1].value.responseTime : undefined,
        message: checks[1].status === 'fulfilled' ? checks[1].value.message : 'Check failed',
      },
      metamarkerFit: {
        name: 'MetaMarker Fit',
        available: checks[2].status === 'fulfilled' && checks[2].value.available,
        lastChecked: now,
        responseTime: checks[2].status === 'fulfilled' ? checks[2].value.responseTime : undefined,
        message: checks[2].status === 'fulfilled' ? checks[2].value.message : 'Check failed',
      },
      gamewear: {
        name: 'GameWear API',
        available: checks[3].status === 'fulfilled' && checks[3].value.available,
        lastChecked: now,
        responseTime: checks[3].status === 'fulfilled' ? checks[3].value.responseTime : undefined,
        message: checks[3].status === 'fulfilled' ? checks[3].value.message : 'Check failed',
      },
      supabase: {
        name: 'Supabase',
        available: checks[4].status === 'fulfilled' && checks[4].value.available,
        lastChecked: now,
        responseTime: checks[4].status === 'fulfilled' ? checks[4].value.responseTime : undefined,
        message: checks[4].status === 'fulfilled' ? checks[4].value.message : 'Check failed',
      },
    };

    this.notifyListeners(state);
    return state;
  }

  static async startMonitoring(intervalMs: number = 30000) {
    await this.checkAllAPIs();
    setInterval(() => this.checkAllAPIs(), intervalMs);
  }
}
