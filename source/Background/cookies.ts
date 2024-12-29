import browser, { Cookies } from 'webextension-polyfill';

import uniq from '../utils/uniq';

const cookieNames: ReadonlyArray<string> = [
  'sso_session',
  'it',
  'ghn_token',
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
      if (cookies.length > 0) {
        cookiesByOrigin.set(origin, cookies);
      }
    })
  );

  return cookiesByOrigin;
}

export async function setTargetCookie(
  origin: string,
  cookie: Cookies.Cookie
): Promise<{
  origin: string;
  cookie: Cookies.Cookie;
}> {
  const details: Cookies.SetDetailsType = {
    url: origin,
    name: cookie.name,
    value: cookie.value,
    path: cookie.path || '/',
    sameSite: cookie.sameSite,
    expirationDate: cookie.expirationDate,
    httpOnly: cookie.httpOnly,
  };

  let updated = {} as Cookies.Cookie;

  try {
    updated = await browser.cookies.set(details);
  } catch (error) {
    console.error('Error setting cookie:', {
      error,
      origin,
      cookieName: cookie.name
    });
  }

  return { origin, cookie: updated };
}