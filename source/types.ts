import type {Cookies} from 'webextension-polyfill';

export type Message = {
  command: 'sync-now' | 'storage-clear';
};

// eslint-disable-next-line no-undef
export type SyncNowResponse = PromiseSettledResult<
  | {
      origin: string;
      cookie: Cookies.Cookie;
    }
  | undefined
>[];

export type StorageClearResponse = boolean;
