import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MyRoute from './MyRoute';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyRoute />
  </StrictMode>,
)