import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import SingleComponent from './components/SingleComponent.jsx';
import BlogManagerComponent from './components/BlogManagerComponent.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AdminManager from './components/AdminManager.jsx';
import Writer from './components/Writer.jsx';
import FormComponent from './components/FormComponent.jsx';
import EditFormComponent from './components/EditFormComponent.jsx';
import PrivateRoute from './PrivateRoute';
import UserPrivateRoute from './UserPrivateRoute';
import CategoryAdmin from './components/categoryAdmin';


const MyRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog/:id" element={<SingleComponent />} />
        <Route path="/blogManager" element={<UserPrivateRoute element={<BlogManagerComponent />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/writer" element={<UserPrivateRoute element={<Writer />} />} />
        <Route path="/create" element={<UserPrivateRoute element={<FormComponent />} />} />
        <Route path="/edit/:id" element={<UserPrivateRoute element={<EditFormComponent />} />} />
        <Route path="/adminManager" element={<PrivateRoute element={<AdminManager />} />} />
        <Route path="/category" element={<PrivateRoute element={< CategoryAdmin />} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoute;
