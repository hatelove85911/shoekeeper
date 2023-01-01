import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ScanPage from './pages/ScanPage';
import InventoryPage from './pages/InventoryPage';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/shoekeeper",
    element: <InventoryPage />,
  },
  {
    path: "/shoekeeper/scan",
    element: <ScanPage />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
