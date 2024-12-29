import browser, {Cookies} from 'webextension-polyfill';

import uniq from '../utils/uniq';

const cookieNames: ReadonlyArray<string> = [
  'sso_session',
  'it'
];

export function isKnownCookie(cookieName: string) {
  return cookieNames.includes(cookieName);
}

async function readCookiesFrom(origin: string): Promise<Cookies.Cookie[]> {
  return (
    await Promise.all(
      cookieNames.map((name) => browser.cookies.get({name, url: origin}))
    )
  ).filter(Boolean);
}

export async function getCookiesByOrigin(origins: string[]) {
  const cookiesByOrigin = new Map<string, Cookies.Cookie[]>();
  await Promise.all(
    uniq(origins).map(async (origin) => {
      const cookies = await readCookiesFrom(origin);
      cookiesByOrigin.set(origin, cookies);
    })
  );

  return cookiesByOrigin;
}

/**
 * Set a Cookie against the target domain.
 *
 * @param url
 * @param target Domain where the Cookie should be saved
 * @param cookie Original Cookie to be copied
 * @returns The saved Cookie
 */
export async function setTargetCookie(
  origin: string,
  // targetDomain: string,
  cookie: Cookies.Cookie
): Promise<{
  origin: string;
  cookie: Cookies.Cookie;
}> {
  const details:Cookies.SetDetailsType = {
    url: origin,
    // domain: targetDomain,
    expirationDate: cookie.expirationDate,
    // httpOnly: cookie.httpOnly,
    name: cookie.name,
    sameSite: cookie.sameSite,
    // secure: cookie.secure,
    value: cookie.value,
    path: cookie.path,
  };

  const updated = await browser.cookies.set(details);
  

  return { origin, cookie: updated };
}
