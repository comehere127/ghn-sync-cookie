import browser, {Cookies} from 'webextension-polyfill';

type CookiesByDomain = {
  [domain: string]: {
    [cookieName: string]: Cookies.Cookie;
  };
};

export type Domain = {
  name: string;
  domain: string;
  syncEnabled: boolean;
};

type StorageFields = {
  cookies: CookiesByDomain;
  domains: Domain[];
  port: string;
};

export const DEFAULT_DOMAINS: Array<Domain> = [
  {
    name: "Portal Test",
    domain: 'test-portal.ghn.tech',
    syncEnabled: true
  },
  {
    name: "Portal Staging",
    domain: 'stg-portal.ghn.tech',
    syncEnabled: false
  }
];

const localStorage = {
  get: <Key extends string = keyof StorageFields>(
    key: Key
  ): Promise<Partial<StorageFields>> => browser.storage.local.get(key),
  set: (items: Partial<StorageFields>) => browser.storage.local.set(items),
};

class CookieCache {
  constructor(private cache: CookiesByDomain) {}

  insert(domain: string, cookie: Cookies.Cookie) {
    this.cache = {
      ...this.cache,
      [domain]: {
        ...(this.cache[domain] || {}),
        [cookie.name]: cookie,
      },
    };
  }

  save = async () => {
    await localStorage.set({cookies: this.cache});
  };

  toArray = () => {
    return Object.entries(this.cache)
      .map(([domain, cookiesByName]) =>
        Object.entries(cookiesByName).map(([cookieName, cookie]) => ({
          domain,
          cookieName,
          cookie,
        }))
      )
      .flat();
  };
}

class Storage {
  private cookieCache: CookieCache | null = null;

  clear = browser.storage.local.clear;

  debug = async () => {
    const all = await browser.storage.local.get(['cookies','domains','port']);
    console.group('Storage.debug',all);
    Object.entries(all).forEach(([key, value]) => {
      console.log('Storage:', key);
      console.table(value);
    });
    console.groupEnd();
  };

  getDomains = async () => {
    const result = await localStorage.get('domains');
    return result.domains ?? DEFAULT_DOMAINS;
  };

  setDomain = async (domain:Domain) => {
    await localStorage.set({
      domains: DEFAULT_DOMAINS.map(item => ({
        ...item,
        syncEnabled: item.domain === domain.domain,
      })),
    });
  };

  setLocalPort = async (port: string) => {
    await localStorage.set({port});
  };

  getLocalPort = async () => {
    const result = await localStorage.get('port');
    return result.port ?? "3000";
  };

  getCookieCache = async () => {
    if (!this.cookieCache) {
      const all = await localStorage.get('cookies');
      this.cookieCache = new CookieCache(all.cookies || {});
    }
    return this.cookieCache;
  };
}

const storage = new Storage();

export default storage;
