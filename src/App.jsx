import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <AppRoutes/>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
    
  )
}

export default App