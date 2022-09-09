/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { SWRConfig } from 'swr';

import Dashboard from './pages/Dashboard/Dashboard';
import './App.scss';
import Login from './pages/Login/Login';

const App = () => (
  <SWRConfig
    value={{
      dedupingInterval: 60000,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }}
  >
    <div style={{ minWidth: 680 }}>
      <Dashboard />
    </div>
  </SWRConfig>
);

export default App;
