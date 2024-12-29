import browser, {Tabs} from 'webextension-polyfill';

import toUrl from '../utils/toUrl';

export function tabsToOrigins(tabs: Tabs.Tab[]) {
  return tabs.map((tab) => toUrl(tab.url)?.origin).filter(Boolean);
}

async function findOpenTabsMatching(urls: string[]) {
  return (
    await Promise.all(urls.map((url) => browser.tabs.query({url})))
  ).flat();
}


export async function findOpenDevUITabs() {
  const tabs = await findOpenTabsMatching([
    'http://localhost:*/*',
  ]);
  return tabs;
}

export async function findOpenProdTabs() {
  return findOpenTabsMatching(['https://test-portal.ghn.tech/*','https://stg-portal.ghn.tech/*']);
}
