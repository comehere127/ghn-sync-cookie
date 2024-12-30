import browser from 'webextension-polyfill';
export const enum Environment {
  TEST = 'test',
  STAGING = 'staging',
  LOCAL = "local"
}

interface DomainInfo {
  environment: Environment | null;
  domain: string;
  isHostDomain: boolean;
  url: string;
}

const DOMAIN_REGEX = /((?:test|stg)-portal\.ghn\.tech|localhost(?::\d+)?)/;

export const analyzeDomain = (url: string): DomainInfo => {
  const match = url.match(DOMAIN_REGEX);
  
  if (!match?.[0]) {
    return {
      environment: null,
      domain: '',
      isHostDomain: false,
      url
    };
  }

  const domain = match[0];
  let environment: Environment | null = null;

  if (domain.startsWith('test-')) {
    environment = Environment.TEST;
  } else if (domain.startsWith('stg-')) {
    environment = Environment.STAGING;
  } else if (domain.startsWith('localhost')) {
    environment = Environment.LOCAL;
  }

  const isHostDomain = environment === Environment.TEST || environment === Environment.STAGING

  return {
    environment,
    domain,
    isHostDomain,
    url
  };
};
export const replaceDomain = (url: string, newDomain: string): string => {
  if (url.includes('localhost')) {
    const urlObj = new URL(url);
    urlObj.host = newDomain.includes(':') ? newDomain : urlObj.hostname = newDomain;
    return urlObj.toString();
  }
  return url.replace(DOMAIN_REGEX, newDomain);
};

export async function openTab(url: string, tab?: browser.Tabs.Tab) {
  if (tab?.id) {
    await browser.tabs.update(tab.id, {
      active: true,
    });
    if (tab.windowId) {
      await browser.windows.update(tab.windowId, {
        drawAttention: true,
        focused: true
      });
    }
    window.close();
  } else {
    const newTab = await browser.tabs.create({
      url: url,
      active: true,
    });
    if (newTab.windowId) {
      await browser.windows.update(newTab.windowId, {
        focused: true,
        drawAttention: true,
      });
    }
  }
}


export function extractDomain(origin: string) {
  const domain = analyzeDomain(origin);
  if (domain) {
    return domain.domain;
  } else {
    return undefined
  }
}
