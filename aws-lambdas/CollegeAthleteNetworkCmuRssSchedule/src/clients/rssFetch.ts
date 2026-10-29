import type { FetchOptions, RssFeedBytes } from '../types.js';
import { detectXmlEncoding } from '../parse/encoding.js';
import { isRetryableHttp, withRetry } from '../util/retry.js';

export function buildFeedUrl(sportUrl: string, season: string): string {
  return `${sportUrl.replace(/\/$/, '')}/${season}/schedule?print=rss`;
}

export async function fetchRssFeed(url: string, options: FetchOptions): Promise<RssFeedBytes> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
            'User-Agent': options.userAgent,
          },
          signal: controller.signal,
        });
        if (isRetryableHttp(res.status)) {
          throw new Error(`RSS retryable status ${res.status}`);
        }
        return res;
      },
      {
        maxAttempts: 3,
        baseDelayMs: 400,
        maxDelayMs: 4000,
        retryOn: (err) => err instanceof Error,
      },
    );

    const body = Buffer.from(await response.arrayBuffer());
    return {
      url,
      status: response.status,
      body,
      declaredEncoding: detectXmlEncoding(body),
    };
  } finally {
    clearTimeout(timer);
  }
}
