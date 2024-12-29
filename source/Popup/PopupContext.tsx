import * as React from "react";


import Storage, { Domain } from '../Background/storage';

interface IPopupContextProps {
  localPort:string
  setLocalPort: React.Dispatch<React.SetStateAction<string>>
  domainSelected: Domain | null
  setDomainSelected: React.Dispatch<React.SetStateAction<Domain | null>>
}

const PopupContext = React.createContext<IPopupContextProps | undefined>(undefined);

interface IPopupProviderProps {
  children: React.ReactNode;
}

function PopupProvider({ children }: IPopupProviderProps): React.ReactElement {
  const [ localPort, setLocalPort ] = React.useState<string>("")
  const [ domainSelected, setDomainSelected ]  =  React.useState<Domain | null>(null)
  const loadLocalPort = React.useCallback(() => {
    Storage.getLocalPort().then(setLocalPort);
  }, []);

  React.useEffect(() => {
    loadLocalPort();
  }, [loadLocalPort]);

  return (
    <PopupContext.Provider value={{
      localPort, setLocalPort,
      domainSelected, setDomainSelected
    }}>
      {children}
    </PopupContext.Provider>
  );
}

const usePopup = (): IPopupContextProps => {
  const context = React.useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};

export { PopupProvider, usePopup };
