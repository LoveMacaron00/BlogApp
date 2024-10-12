import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdminComponent from './SidebarAdminComponent';

const AdminManager = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
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
        fetchCategories();
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/getCategory.php');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filteredCategories = categories.filter(category =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    setCurrentCategories(paginatedCategories);

    const totalPageNumbers = Math.ceil(filteredCategories.length / itemsPerPage);
    setPageNumbers([...Array(totalPageNumbers).keys()].map(i => i + 1));
  }, [categories, searchTerm, currentPage, itemsPerPage]);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const deleteCategory = async (id) => {
    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/deleteCategory.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, action: 'delete' }),
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'การลบหมวดหมู่ล้มเหลว');
      }
      
      fetchCategories();
    } catch (error) {
      setError(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const addCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    
    if (categoryName) {
      try {
        const response = await fetch('http://localhost/BlogApi-v1/Server/addCategory.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categoryName }),
        });
    
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'การเพิ่มหมวดหมู่ล้มเหลว');
        }
        
        fetchCategories();
      } catch (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  const editCategory = async (id, currentName) => {
    const newName = prompt('Enter new category name:', currentName);

    if (newName && newName !== currentName) {
      try {
        const response = await fetch('http://localhost/BlogApi-v1/Server/editCategory.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, categoryName: newName }),
        });
    
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'การแก้ไขหมวดหมู่ล้มเหลว');
        }
        
        fetchCategories();
      } catch (error) {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="custom-container">
      <div className="row">
        <div className="col-md-3">
          <SidebarAdminComponent />
        </div>
        <div className="col-md-7">
          <h1 className="mt-4 mb-4">Admin Manager</h1>
          <h3 className="mt-4 mb-4">จัดการหมวดหมู่</h3>
          <div className="d-flex justify-content-between mb-3">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
            <button className="btn btn-primary" onClick={addCategory}>Add Category</button>
          {loading && <p>Loading...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && (
            <>
              {currentCategories.length === 0 ? (
                <p>ไม่มีหมวดหมู่ที่ตรงกับการค้นหา</p>
              ) : (
                <>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCategories.map((category, index) => (
                        <tr key={category.id}>
                          <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                          <td>{category.categoryName}</td>
                          <td>
                            <button className="btn btn-warning me-2" onClick={() => editCategory(category.id, category.categoryName)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => deleteCategory(category.id)}>ลบ</button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
