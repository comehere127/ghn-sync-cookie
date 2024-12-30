import * as React from 'react';

import browser from 'webextension-polyfill';

import Storage from './Background/storage';
import { usePopup } from './Popup/PopupContext';
import type {Message, SyncNowResponse} from './types';

type State = {
  isLoading: boolean;
  results?:  SyncNowResponse;
  error?:  Error;
};

const initState: State = {
    isLoading: false,
    results: undefined,
    error: undefined, 
}
export default function useSyncNow() {
  const [state, setState] = React.useState<State>(initState);
  const { localPort, domainSelected } = usePopup() 

  React.useEffect(() => {
    setState(initState)
  },[domainSelected])

  const syncNow = React.useCallback(async () => { 
    await Storage.setLocalPort(localPort)
    const setAndReturnState = (s: State) => {
      setState(s);
      return s;
    };

    setState({
      ...initState,
      isLoading: true,
    });
    try {
      const results = (await browser.runtime.sendMessage({
        command: 'sync-now',
      } as Message));
      if (results instanceof Error) {
        throw results
      }
      return setAndReturnState({
        ...initState,
        results,
      });
    } catch (err) {
      return setAndReturnState({
        ...initState,
        error: err as Error,
      });
    }
  }, [localPort]);

  return {
    syncNow,
    ...state,
  };
}
