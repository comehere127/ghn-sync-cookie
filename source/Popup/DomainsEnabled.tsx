import * as React from 'react';

import './domainsEnabled.css';
import Storage, { Domain } from '../Background/storage';
import { isInputNumber } from '../utils/inputNumber';
import { usePopup } from './PopupContext';

// eslint-disable-next-line
const useDomainsEnabled = () => {
  const [domains, setDomains] = React.useState<Domain[]>();

  const refreshDomains = React.useCallback(() => {
    Storage.getDomains().then(setDomains);
  }, []);

  React.useEffect(() => {
    refreshDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    domains,
    refreshDomains,
  };
};
function ListItem({
  domain,
  onChange,
}: {
  domain: Domain;
  onChange: (selected?:string)=>void;
  }) {
  return (
    <>
      <input className="checkbox-domain" type="radio" name="domain" id={`input-domain-${domain.domain}`} checked={domain.syncEnabled}
        onChange={async (e) => {
            onChange(e.target.id);             
            await Storage.setDomain({
              ...domain,
              syncEnabled: true,
            });
        }}
      />
      <label htmlFor={`input-domain-${domain.domain}`}>							
        <span data-hover={domain.name}>{domain.name}</span>
      </label>
    </>
  );
}

function DomainsEnabled() {
  const { domains } = useDomainsEnabled();
  const [ fromDomains, setFromDomains ] = React.useState<Domain[]>([]);
  const { localPort, setLocalPort, setDomainSelected } = usePopup()
  React.useEffect(() => {
    if (domains) {
      setFromDomains(domains);
    }
  }, [domains]); 

  React.useEffect(() => {
    setDomainSelected(fromDomains.find((item) => item.syncEnabled) ?? null)
  }, [fromDomains, setDomainSelected])
  
  const onKeyChange = React.useCallback((e: React.KeyboardEvent) => isInputNumber(e), [])
  
  const onFromDomainChanged = React.useCallback((selected?:string) => {
    setFromDomains((prev) => {
      const newDomains = prev.map(item => ({
        ...item,
        syncEnabled: selected?.indexOf(item.domain) !== -1,
      }));
      return newDomains;
    });
  }, [])
  
  const onLocalPortChanged = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const port = e.target.value;
      setLocalPort(port);
  }, [setLocalPort]);

  return (
    <section className="domainsEnabled-grid">
      <div>
        <h2>Sync from</h2>
        <div className='domainsEnabled-from'>
          {
            fromDomains?.map((domain) => (
              <ListItem
                key={domain.domain}
                domain={domain}
                onChange={onFromDomainChanged}
              />
            ))
          }
        </div>
        <h2>Sync to locahost</h2>
        <i>local development PORT</i>
        <input
          type="text"
          placeholder='Please enter local development PORT'
          value={localPort}
          onKeyDown={onKeyChange}
          onChange={onLocalPortChanged} />
      </div>
    </section>
  );
}

export default React.memo(DomainsEnabled);
