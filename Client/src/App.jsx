import { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarComponent from "./components/NavbarComponent.jsx";
import Footer from './components/Footer.jsx';
import { Link } from "react-router-dom";
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewOrder, setViewOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAPI = async () => {
    try {
      const response = await axios.get("http://localhost/BlogApi-v1/Server/blog.php");
      setData(response.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost/BlogApi-v1/Server/getCategory.php");
      setCategories(response.data);
    } catch (error) {
      setError('Error fetching categories');
    }
  };

  useEffect(() => {
    fetchAPI();
    fetchCategories();
  }, []);

  const filteredData = data.filter(item =>
    (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.writerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === '' || item.categoryName === selectedCategory) &&
    (!startDate || new Date(item.created_at) >= new Date(startDate)) &&
    (!endDate || new Date(item.created_at) <= new Date(endDate))
  );

  const sortedData = filteredData.sort((a, b) => {
    if (viewOrder === 'desc') {
      return b.view - a.view;
    } else if (viewOrder === 'asc') {
      return a.view - b.view;
    } else {
      return 0;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <NavbarComponent />
      <div className="container">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="form-control mb-4"
          style={{ maxWidth: '500px', width: '100%' }}
        />
        <div className="filter-container mb-4">
          <label htmlFor="categorySelect">เลือกหมวดหมู่:</label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px', width: '100%' }}
          >
            <option value="">ทั้งหมด</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
        <div className="filter-container mb-4">
          <label htmlFor="startDate">วันที่เริ่มต้น:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="form-control mb-2"
            style={{ maxWidth: '200px', width: '100%' }}
          />
          <label htmlFor="endDate">วันที่สิ้นสุด:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px', width: '100%' }}
          />
        </div>
        <div className="filter-container mb-4">
          <label htmlFor="viewOrder">เรียงลำดับยอดดู:</label>
          <select
            id="viewOrder"
            value={viewOrder}
            onChange={e => setViewOrder(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px', width: '100%' }}
          >
            <option value="">เลือก...</option>
            <option value="desc">จากมากไปน้อย</option>
            <option value="asc">จากน้อยไปมาก</option>
          </select>
        </div>
        {loading && <p>กำลังโหลด...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        <ul className="item-list">
          {currentData.map(val => (
            <li className="item-container" key={val.id}>
              <Link 
                to={`/blog/${val.id}`} 
                onClick={() => handleView(val.id)}
              >
                {val.image_url && <img src={val.image_url} alt={val.title} className="item-image" />}
              </Link>
              <div className="item-content">
                <Link 
                  to={`/blog/${val.id}`} 
                  onClick={() => handleView(val.id)}
                >
                  <h2>{val.title}</h2>
                </Link>
                <div className="pt-3">
                  {val.description.substring(0, 250)}
                </div>
                <p className='pt-3'><strong>👁‍🗨:</strong> {val.view}</p>
                <p><strong>หมวดหมู่:</strong> {val.categoryName}</p>
                <p className="text-muted">ผู้เขียน : {val.writerName} , เผยแพร่ : {new Date(val.created_at).toLocaleString()} , อัพเดต : {new Date(val.updated_at).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
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
      </div>
      <Footer />
    </>
  );
}

export default App;
