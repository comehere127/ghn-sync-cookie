// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import * as React from 'react';
import ReactDOM from 'react-dom';

import ErrorBoundary from './ErrorBoundary';
import Popup from './Popup';
import { PopupProvider } from './PopupContext';

ReactDOM.render(
  <ErrorBoundary>
    <PopupProvider>
      <Popup />
    </PopupProvider>
  </ErrorBoundary>,
  document.getElementById('popup-root')
);
