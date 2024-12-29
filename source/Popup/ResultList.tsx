import * as React from 'react';

import {serializeError} from 'serialize-error';

import FailedIcon from '../icons/FailedIcon';
import SuccessIcon from '../icons/SuccessIcon';
import type {SyncNowResponse} from '../types';
import uniq from '../utils/uniq';
import uniqBy from '../utils/uniqBy';
import CopyButton from './CopyButton';
import { usePopup } from './PopupContext';
interface ResultListProps{
  results: SyncNowResponse
}
function ResultList({ results }: ResultListProps) {
  const { localPort } = usePopup()
  const successfulCookies = React.useMemo(()=>Array.from(
    new Set(
      results.map((promiseResult) =>
        promiseResult.status === 'fulfilled' ? promiseResult.value : null
      )
    )
  ).filter(Boolean),[results]);

  const cookies = React.useMemo(()=>uniqBy(
    successfulCookies.map((cookie) => cookie.cookie),
    (cookie) => cookie.name
  ), [successfulCookies]);
  
  const origins = React.useMemo(() => uniq(successfulCookies.map((cookie) => cookie.origin)), [successfulCookies]);
  return (
    <>
      {cookies.length > 0 &&
        <table className='found-cookies'>
        <tbody>
          <tr>
            <th colSpan={2}>Found Cookies</th>
          </tr>
          {cookies.map((cookie) => (
            <tr key={cookie.name}>
              <td>{cookie.name}</td>
              <td className="cookie-value">
                <div className="cookie-value-content">
                  {cookie.value}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      }
      
      <table>
        {cookies.length > 0 &&
          <thead>
          <tr>
            <th colSpan={3}>Domains</th>
          </tr>
          </thead>
        }
        
        <tbody>
          {results.map((promiseResult, index) =>
            promiseResult.status === 'fulfilled' ? null : (
              <tr key={index} className="error-row">
                <td>
                  <FailedIcon width={20} height={20} />
                </td>
                <td colSpan={2}>
                  {JSON.stringify(serializeError(promiseResult.reason)) ||
                    'Rejected'}
                </td>
              </tr>
            )
          )}
          {origins.map((origin) => (
            <tr key={origin} className="success-row">
              <td>
                <SuccessIcon width={20} height={20} />
              </td>
              <td>
                <a href={`${origin}:${localPort}`} target="_blank" rel="noreferrer">
                  {origin}:{localPort}
                </a>
              </td>
              <td align="right">
                <CopyButton
                  text={results
                    .map((promiseResult) => {
                      if (
                        promiseResult.status === 'fulfilled' &&
                        promiseResult.value?.origin === origin
                      ) {
                        const {
                          domain,
                          expirationDate,
                          name,
                          path,
                          sameSite,
                          value,
                        } = promiseResult.value.cookie;
                        return `document.cookie='${name}=${value};domain=${domain};expires=${expirationDate};path=${path};samesite=${sameSite};';`;
                      }
                      return '';
                    })
                    .filter(Boolean)
                    .join('\n')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default ResultList;
