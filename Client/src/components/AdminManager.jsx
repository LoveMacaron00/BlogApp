import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdminComponent from './SidebarAdminComponent';

const AdminManager = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pageNumbers, setPageNumbers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id === 'admin') {
        setIsAdmin(true);
        fetchUsers();
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/User.php');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      setLoading(false);
    }
  };

  const deleteUser = async userId => {
    try {
      await fetch('http://localhost/BlogApi-v1/Server/User.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          action: 'delete'
        }),
      });
      fetchUsers();
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  useEffect(() => {
    const filteredUsers = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCurrentUsers(filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));

    const totalPageNumbers = Math.ceil(filteredUsers.length / itemsPerPage);
    setPageNumbers([...Array(totalPageNumbers).keys()].map(i => i + 1));
  }, [users, searchTerm, currentPage, itemsPerPage]);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  if (!isAdmin) return null;

  return (
    <>
      <div className="custom-container">
        <div className="row">
          <div className="col-md-3">
            <SidebarAdminComponent />
          </div>
          <div className="col-md-7">
            <h1 className="mt-4 mb-4">Admin Manager</h1>
            <h3 className="mt-4 mb-4">จัดการผู้ใช้</h3>
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control mb-3"
            />
            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <button className="btn btn-danger" onClick={() => deleteUser(user.id)}>ลบ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <nav>
                  <ul className="pagination">
                    <li className="page-item">
                      <button 
                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : currentPage)} 
                        className="page-link"
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {pageNumbers.map(number => (
                      <li key={number} className="page-item">
                        <button 
                          onClick={() => paginate(number)} 
                          className={`page-link ${currentPage === number ? 'active' : ''}`}
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                    <li className="page-item">
                      <button 
                        onClick={() => paginate(currentPage < pageNumbers.length ? currentPage + 1 : currentPage)} 
                        className="page-link"
                        disabled={currentPage === pageNumbers.length}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManager;
