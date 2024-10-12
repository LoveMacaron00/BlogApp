import React, { useEffect, useState } from 'react';
import SidebarComponent from './SidebarComponent';
import NavbarComponent from './NavbarComponent';
import './SidebarComponent.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BlogManagerComponent() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBlogs = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('ไม่พบ token');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost/BlogApi-v1/Server/getUserBlogs.php', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setBlogs(data);
        }
      } catch (error) {
        setError('Error fetching blogs: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const deleteBlog = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบล็อกนี้?')) {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('ไม่พบ token');
        return;
      }

      try {
        const response = await fetch('http://localhost/BlogApi-v1/Server/deleteBlog.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== id));
        }
      } catch (error) {
        setError('Error deleting blog: ' + error.message);
      }
    }
  };

  const handleView = async (id) => {
    try {
      console.log('ID ที่ส่งไป:', id);
      const response = await axios.post(
        "http://localhost/BlogApi-v1/Server/blog.php",
        { id: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('ข้อมูลที่ได้จากเซิร์ฟเวอร์:', response.data);
  
      if (response.data.success) {
        console.log('ยอดการดูถูกอัปเดตเรียบร้อย');
      } else {
        console.error('ไม่สามารถอัปเดตยอดการดูได้:', response.data.error);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error.message);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.writerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBlog = currentPage * itemsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredBlogs.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <NavbarComponent />
      <div className="custom-container">
        <div className="row">
          <div className="col-md-3">
            <SidebarComponent />
          </div>
          <div className="col-md-8">
            <h1 className="mt-4 mb-4">Your Blogs</h1>
            <Link to="/create">
              <button className="btn btn-primary mb-3" style={{ maxWidth: '100px', width: '100%' }}>Create</button>
            </Link>
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control mb-3"
              style={{ maxWidth: '400px', width: '100%' }}
            />
            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>หัวเรื่อง</th>
                      <th>คำอธิบาย</th>
                      <th>นามปากกา</th>
                      <th>👁‍🗨</th>
                      <th>สร้างเมื่อ</th>
                      <th>อัพเดตเมื่อ</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBlogs.map((blog, index) => (
                      <tr key={blog.id}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>{blog.title}</td>
                        <td>{blog.description}</td>
                        <td>{blog.writerName}</td>
                        <td>{blog.view}</td>
                        <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                        <td>{new Date(blog.updated_at).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/blog/${blog.id}`} onClick={() => handleView(blog.id)} >
                            <button className="btn btn-info mr-2" style={{ maxWidth: '100px', width: '100%' }}>ดูบทความ</button>
                          </Link>
                          <Link to={`/edit/${blog.id}`}>
                            <button className="btn btn-warning mr-2"  style={{ maxWidth: '100px', width: '100%' }}>แก้ไข</button>
                          </Link>
                          <button className="btn btn-danger"  style={{ maxWidth: '100px', width: '100%' }} onClick={() => deleteBlog(blog.id)}>ลบ</button>
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
}

export default BlogManagerComponent;
