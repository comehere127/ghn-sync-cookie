import * as React from 'react';

import browser from 'webextension-polyfill';

import './popup.css';
import { Domain } from '../Background/storage';
import ExternalIcon from '../icons/ExternalIcon';
import FailedIcon from '../icons/FailedIcon';
import useSyncNow from '../useSyncNow';
import { analyzeDomain, openTab, replaceDomain } from '../utils/domainChecker';
import DomainsEnabled from './DomainsEnabled';
import { usePopup } from './PopupContext';
import ResultList from './ResultList';
import VersionBadge from './VersionBadge';

function ErrorView({ message }: { message: string }) {
  return <section id="popup">
    <h1>{message}</h1>
  </section>
}

function LoadingView() {
  return <ErrorView message="Validating..." />
}

type ValidationState = {
  error: string | null;
  isValidating: boolean;
};

type ValidationAction = 
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'RESET' };

const INITIAL_STATE: ValidationState = { error: null, isValidating: true };

function validationReducer(state: ValidationState, action: ValidationAction): ValidationState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload, isValidating: false };
    case 'SET_VALIDATING':
      return { ...state, isValidating: action.payload };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

const ButtonGroup = React.memo(({ 
  onSync, 
  onDevUI, 
  disabled 
}: { 
  onSync: () => void;
  onDevUI: () => void;
  disabled: boolean;
}) => (
  <div className="button-group">
    <button type="button" className="sync-button" onClick={onSync} disabled={disabled}>
      Sync
    </button>
    <button type="button" className="dev-ui-button" onClick={onDevUI} disabled={disabled}>
      Open in Dev UI
    </button>
  </div>
));

interface ErrorProps{
  error: string
  domainSelected: Domain | null
}

const ErrorAlert = React.memo(({ error, domainSelected }: ErrorProps) => {
  const isExternal = React.useMemo(() => error.includes("No cookies found in cache"), [error])
  const onOpenDomain = React.useCallback(() => {
    if (domainSelected) {
      openTab(`https://${domainSelected.domain}`)  
    }
  },[domainSelected])
  return  <div className="error-alert">
    <FailedIcon width={20} height={20} />
    <div className="button-group">
      <span dangerouslySetInnerHTML={{ __html: error }} />
      {isExternal && <ExternalIcon style={
        {
          cursor: "pointer",
        }
      } width={18} height={18} onClick={onOpenDomain} />}
    </div>
  </div>
});

function Popup() {
  const { results, isLoading, error: syncError, syncNow } = useSyncNow();
  const { localPort, domainSelected } = usePopup();
  const [{ error, isValidating }, dispatch] = React.useReducer(validationReducer, INITIAL_STATE);

  React.useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const validateTab = async () => {
      if (!mounted) return;
      
      dispatch({ type: 'RESET' });
      dispatch({ type: 'SET_VALIDATING', payload: true });

      try {
        const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
        
        if (!mounted || abortController.signal.aborted) return;

        if (!tab) {
          dispatch({ type: 'SET_ERROR', payload: 'No active tab' });
          return;
        }

        const currentTab = analyzeDomain(tab.url!);
        if (currentTab.environment === null) {
          dispatch({ type: 'SET_ERROR', payload: 'Please using GHN Portal to sync cookies' });
          return;
        }

        dispatch({ type: 'SET_ERROR', payload: null });

      } catch (err) {
        if (mounted && !abortController.signal.aborted) {
          console.error('Validation error:', err);
          dispatch({ type: 'SET_ERROR', payload: 'Error checking tab status' });
        }
      } finally {
        if (mounted && !abortController.signal.aborted) {
          dispatch({ type: 'SET_VALIDATING', payload: false });
        }
      }
    };

    validateTab();
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  const handleDevUIClick = React.useCallback(async () => {
    try {
      const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true });
      if (!currentTab?.url) throw new Error('No active tab');
      let newUrl = replaceDomain(currentTab.url, `localhost:${localPort}`);  

      newUrl = newUrl.replace("https://", "http://");
      const [existingTab] = await browser.tabs.query({ url: newUrl });
      openTab(newUrl, existingTab);
    } catch (err) {
      console.error('Error handling dev UI:', err);
    }
  }, [localPort]);

  if (error) return <ErrorView message={error} />;
  if (isValidating) return <LoadingView />;

  return (
    <section id="popup">
      <h1>GHN Cookie Sync</h1>
      <DomainsEnabled />
      <ButtonGroup 
        onSync={syncNow}
        onDevUI={handleDevUIClick}
        disabled={isLoading || !localPort}
      />
      {syncError && <ErrorAlert error={syncError.message} domainSelected={domainSelected} />}
      <div className="result">
        {results?.length ? <ResultList results={results} /> : null}
      </div>
      <VersionBadge />
    </section>
  );
}

export default React.memo(Popup);