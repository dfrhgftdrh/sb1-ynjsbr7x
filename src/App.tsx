import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DatabaseCheck } from './components/DatabaseCheck';
import router from './routes';

function App() {
  return (
    <DatabaseCheck>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </DatabaseCheck>
  );
}

export default App;