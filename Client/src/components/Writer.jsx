import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import SidebarComponent from './SidebarComponent';
import NavbarComponent from './NavbarComponent';
import "./SidebarComponent.css";
import "./Writer.css";

function Writer() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [writerName, setWriterName] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteWriterId, setDeleteWriterId] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/getWriterUusr.php', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        const uniqueBlogs = data.filter((blog, index, self) =>
          index === self.findIndex((b) => b.writer === blog.writer)
        );
        setBlogs(uniqueBlogs);
      }
    } catch (error) {
      setError('Error fetching blogs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAddWriter = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }
  
    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/getWriterUusr.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writer: writerName }),
      });
  
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
        setWriterName('');
        setShowModal(false);
        fetchBlogs();
      }
    } catch (error) {
      setError('Error adding writer: ' + error.message);
      setSuccess(false);
    } finally {

      setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 1000);
    }
  };

  const handleDeleteWriter = async () => {
    const token = localStorage.getItem('token');
    if (!token || !deleteWriterId) {
      setError('No token or writer ID found');
      return;
    }
  
    try {
      const response = await fetch('http://localhost/BlogApi-v1/Server/deleteWriter.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteWriterId }),
      });
  
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
        setShowDeleteModal(false);
        setDeleteWriterId(null);
        fetchBlogs();
      }
    } catch (error) {
      setError('Error deleting writer: ' + error.message);
      setSuccess(false);
    } finally {

      setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 1000);
    }
  };

  const handleShowDeleteModal = (id) => {
    setDeleteWriterId(id);
    setShowDeleteModal(true);
  };

  const hasWriter = blogs.length > 0;

  return (
    <>
      <NavbarComponent />
      <div className="custom-container">
        <div className="row">
          <div className="col-md-3">
            <SidebarComponent />
          </div>
          <div className="col-md-7">
            <h1 className="mt-4 mb-4">นามปากกา</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <div className="alert alert-info">Loading...</div>}
            {!hasWriter && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Add Writer
              </Button>
            )}
<div className="row">
  {blogs.map((blog) => (
    <div className="col-md-6 mb-4" key={blog.id}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">นักเขียน</h5>
          <p className="card-text">{blog.writerName}</p>
          <Button
            variant="danger"
            className="btn"
            onClick={() => handleShowDeleteModal(blog.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>
          </div>
        </div>
      </div>

      {/* Modal สำหรับการเพิ่ม Writer */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มนักเขียน</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">เพิ่มนักเขียนสำเร็จแล้ว!</div>}
          <Form>
            <Form.Group controlId="formWriterName">
              <Form.Label>นามปากกา</Form.Label>
              <Form.Control
                type="text"
                value={writerName}
                onChange={(e) => setWriterName(e.target.value)}
                placeholder="ใส่นามปากกา"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ปิด
          </Button>
          <Button variant="primary" onClick={handleAddWriter}>
            เพิ่มนักเขียน
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal สำหรับการลบ Writer */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>ลบนักเขียน</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">ลบนักเขียนสำเร็จแล้ว!</div>}
          <p>คุณแน่ใจหรือไม่ว่าต้องการลบนักเขียนคนนี้? ข้อมูล Blog ที่เชื่อมโยงกับนักเขียนนี้จะถูกลบไปด้วย</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            ปิด
          </Button>
          <Button variant="danger" onClick={handleDeleteWriter}>
            ลบ
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Writer;
