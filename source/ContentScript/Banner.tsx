import * as React from 'react';

import FailedIcon from '../icons/FailedIcon';
import useSyncNow from '../useSyncNow';

function Styles() {
  return (
    <style>
      {`
      :root {
        /* colors */
        --sync-black: #0d0d0d;

        --sync-surface100: #1A141F;

        --sync-white: #fff;
        --sync-dark-light: #353746;
        --sync-red: #da2c4d;
        --sync-yellow: #f8ab37;
        --sync-primary: #FF5200;
        
        --sync-gray500: #EBE6EF;
        --sync-gray400: #D6D0DC;
        --sync-gray300: #998DA5;
        --sync-gray200: #43384C;
        --sync-gray100: #342B3B;

        --sync-red400: #F32F35;
        --sync-red300: #F55459;

        --sync-green400: #26B593;
      }
      #__ghn_cookie_sync_banner__ {
        align-items: self-end;
        color: var(--sync-gray500);
        display: flex;
        flex-direction: column;
        font-size: 16px;
        font-size: 2em;
        gap: 8px;
        justify-content: center;
        padding: 16px;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 99999;
      }

      #__ghn_cookie_sync_banner__ h1 {
        font-size: 1.625rem;
        font-weight: 600;
        text-align: center;
      }

      #__ghn_cookie_sync_banner__ .sync-button {
        background-color: var(--sync-primary);
        border-radius: 4px;
        border-radius: 4px;
        border: 1px solid var(--sync-primary);
        box-shadow: 0 1px 4px rgb(10 8 12 / 20%);
        color: var(--sync-white);
        cursor: pointer;
        display: inline-block;
        font-size: 0.875rem;
        font-weight: 600;
        height: 34px;
        line-height: 1rem;
        margin-bottom: 16px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 8px;
        text-transform: none;
      }

      #__ghn_cookie_sync_banner__ .error-alert {
        background: white;
        border-radius: 4px;
        font-size: 16px;
      }


      #__ghn_cookie_sync_banner__ .error-alert svg {
        color: rgba(245, 84, 89, 0.5);
      }

      #__ghn_cookie_sync_banner__ .error-alert > div {
        background: rgba(245, 84, 89, 0.09);
        border-radius: 4px;
        border: 1px solid rgba(245, 84, 89, 0.5);
        color: black;
        display: flex;
        gap: 8px;
        padding: 12px 16px;
      }
      #__ghn_cookie_sync_banner__ .error-alert > div > a {
        font-weight: bold;
        color: blue;
      }
    `}
    </style>
  );
}

export default function Banner() {
  const { syncNow, error } = useSyncNow();

  return (
    <React.Fragment>
      <Styles />
      <div id="__ghn_cookie_sync_banner__">
          <button
            type="button"
            className="sync-button"
            onClick={async () => {
              const { results, error: err } = await syncNow();
              if (!err && results?.length) {
                const target = `${window.location.origin}/`;
                window.location.href = target;
              }
            }}
          >
            Sync Cookies
          </button>

        {error  ? (
          <div className="error-alert">
            <div>
              <FailedIcon width={24} height={24} />
              <div>{error.message}</div>
            </div>
            <a
                target="_blank"
                href="https://test-portal.ghn.tech/"
                rel="noreferrer"
            >
              Test
            </a>
            <a
                target="_blank"
                href="https://stg-portal.ghn.tech/"
                rel="noreferrer"
            >
              Staging
            </a>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}
