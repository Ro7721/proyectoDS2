export interface ApiEnvelope<T> {
  data?: T;
  response?: {
    type?: string;
    message?: string;
    listMessage?: string[];
  };
  error?: {
    message?: string;
  };
}

export function parseApiPayload<T = unknown>(payload: unknown): T | ApiEnvelope<T> {
  if (typeof payload !== 'string') {
    return payload as T | ApiEnvelope<T>;
  }

  try {
    return JSON.parse(payload) as T | ApiEnvelope<T>;
  } catch {
    return payload as T;
  }
}

export function unwrapApiResponse<T>(payload: unknown): T {
  const parsed = parseApiPayload<T>(payload);

  if (isApiEnvelope<T>(parsed) && parsed.data !== undefined) {
    return parsed.data;
  }

  return parsed as T;
}

export function getApiMessage(payload: unknown, fallback = 'Ocurrió un error inesperado'): string {
  const parsed = parseApiPayload(payload);

  if (isApiEnvelope(parsed)) {
    return parsed.response?.listMessage?.[0]
      ?? parsed.response?.message
      ?? parsed.error?.message
      ?? fallback;
  }

  return fallback;
}

export function isApiEnvelope<T = unknown>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(value && typeof value === 'object' && ('data' in value || 'response' in value || 'error' in value));
}
