import browser, {Cookies, Tabs} from 'webextension-polyfill';

import type {Message, StorageClearResponse, SyncNowResponse} from '../types';
import uniqBy from '../utils/uniqBy';
import {getCookiesByOrigin, isKnownCookie, setTargetCookie} from './cookies';
import {
  analyzeDomain,
  extractDomain,
} from './domains';
import Storage from './storage';
import { findOpenProdTabs, tabsToOrigins} from './tabs';

function debugResults(
  event: string,
  // eslint-disable-next-line no-undef
  results: PromiseSettledResult<
    | {
        origin: string;
        cookie: browser.Cookies.Cookie;
      }
    | undefined
  >[]
) {
  console.log(event);
  console.table(
    results.map((result) => {
      const value = result.status === 'fulfilled' ? result.value : result;
      return {
        status: result.status,
        reason: null,
        ...value,
      };
    })
  );
}

/**
 * Look at a list of open `*.ghn.tech` tabs, grab the cookies from them and
 * save them for later.
 */
async function saveProdCookies(prodOrigins: string[]) {
  // The cookies are the same on `foo.ghn.tech` and `bar.ghn.tech`, they're
  // set against `.ghn.tech`. So we only need to ask for each unique host.
  const origins = uniqBy(prodOrigins, extractDomain);
  const prodCookiesByOrigin = await getCookiesByOrigin(origins);

  // Insert those cookies into storage so we can use them even if the prod tabs
  // get closed and we can't read them fresh again.
  const cookieCache = await Storage.getCookieCache();
  Array.from(prodCookiesByOrigin.entries()).flatMap(([origin, cookies]) =>
    cookies.map((cookie) =>
      cookieCache.insert(analyzeDomain(origin).domain || origin, cookie)
    )
  );
  await cookieCache.save();
}

async function findAndCacheData() {
  const openProdTabs = await findOpenProdTabs()

  await saveProdCookies(tabsToOrigins(openProdTabs));
}

async function setCookiesForLocalhost() {
  const [ cookieCache, domains] = await Promise.all([
    Storage.getCookieCache(),
    Storage.getDomains(),
  ]);
  // Get selected domain
  const domainSelected = domains.find((domain) => domain.syncEnabled)
  if (!domainSelected) {
    throw new Error('No domain selected')
  }
  const cookieList = cookieCache.toArray();
  // Get cookie by domain selected
  const domainCookies = cookieList.filter((cookie) => cookie.domain === domainSelected.domain)

  if (domainCookies.length === 0) {
    throw new Error(`No cookies found in cache. Visit <b>${domainSelected.name}</b> to authenticate`);
  }
  const targetOrigins = ["localhost"]

  const results = Promise.allSettled(
    targetOrigins.flatMap(() =>
      domainCookies.map(({ cookie }) => setTargetCookie("http://localhost", cookie))
    )
  );
  return results;
}

/**
 * When a cookie is updated (logging in or out of ghn.tech) we should automatically
 * propagate that into all our targets.
 *
 * @param changeInfo
 */
async function onCookieChanged(
  changeInfo: Cookies.OnChangedChangeInfoType
): Promise<void> {
  const { cookie } = changeInfo;
  if (!analyzeDomain(cookie.domain).isHostDomain || !isKnownCookie(cookie.name)) {
    return;
  }
  try {
    console.group('Received onCookieChanged',JSON.stringify(changeInfo));

    const cookieCache = await Storage.getCookieCache();
    cookieCache.insert(cookie.domain, cookie);
    await cookieCache.save();

    const results = await setCookiesForLocalhost();
    debugResults('Cookie did update', results);
    console.groupEnd();
  // eslint-disable-next-line no-empty
  } catch (_error) { 
  } finally {
    console.groupEnd();
  }
}

async function onTabUpdated(
  _tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
): Promise<void> {
  if (!origin || !analyzeDomain(tab.url!).isHostDomain) {
    return;
  }
  try {
    console.group('Received onTabUpdated', {changeInfo});
    const origins = tabsToOrigins([tab]);
    await saveProdCookies(origins);

    const results = await setCookiesForLocalhost();
    debugResults('Tab did update', results);
  // eslint-disable-next-line no-empty
  } catch (_error) { 
  } finally {
    console.groupEnd();
  }
}

/**
 * When we get a message from the browser, read out the command, exec it and return the result
 */
async function onMessage(
  request: Message
): Promise<SyncNowResponse | StorageClearResponse | Error | false> {
  if (!request.command) {
    return false;
  }
  switch (request.command) {
    case 'sync-now': {
      await findAndCacheData();
      const results = await setCookiesForLocalhost();
      debugResults('Sync complete', results);
      console.groupEnd();
      return results;
    }
    case 'storage-clear':
      await Storage.clear();
      console.groupEnd();
      return true;
  }
}

/**
 * Service-worker entrypoint.
 */
(async function init() {
  console.clear();
  Storage.clear();
  console.info('Cookie Sync Service Worker is starting...');

  browser.cookies.onChanged.addListener(onCookieChanged);
  browser.tabs.onUpdated.addListener(onTabUpdated);
  browser.runtime.onMessage.addListener(onMessage);
  try {
    await onMessage({command: 'sync-now'});
  // eslint-disable-next-line no-empty
  } catch (_e) {
  } finally {
    await Storage.debug();
  }

})();

export {};
