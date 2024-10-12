import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavbarComponent from "./NavbarComponent";
import axios from "axios";
import Swal from "sweetalert2";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditFormComponent = () => {
    const { id } = useParams();
    const [state, setState] = useState({
        title: "",
        description: "",
        writer: "",
        category: "",
    });
    const { title, description, writer, category } = state;
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [writers, setWriters] = useState([]); // เปลี่ยนชื่อเป็น writers
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError('ไม่พบ token');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost/BlogApi-v1/Server/getidUser.php?id=${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                setState({
                    title: result.title,
                    description: result.description,
                    writer: result.writerName,
                    category: result.categoryName,
                });
                setContent(result.content);
                setOldImage(result.image_url);
                setLoading(false);
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost/BlogApi-v1/Server/getCategory.php');
                setCategories(response.data);
            } catch (error) {
                setError('ไม่สามารถโหลดหมวดหมู่ได้');
            }
        };

        const fetchWriters = async () => {
            try {
                const response = await axios.get('http://localhost/BlogApi-v1/Server/getWriterUusr.php', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                setWriters(response.data);
            } catch (error) {
                setError('ไม่สามารถโหลดนักเขียนได้');
            }
        };

        fetchCategories();
        fetchWriters();
        setLoading(false);
    }, []);

    const inputValue = name => event => {
        setState({ ...state, [name]: event.target.value });
    };

    const submitContent = (content) => {
        setContent(content);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
    
        if (!token) {
            setError('ไม่พบ token');
            return;
        }
    
        const formData = new FormData();
        formData.append('id', id); // เพิ่มข้อมูล id
        formData.append('title', title);
        formData.append('description', description);
        formData.append('content', content);
        formData.append('writer', writer);
        formData.append('category', category);
        if (file) {
            formData.append('file', file);
        }
    
        // แสดงข้อมูลที่ส่งไปในคำขอ PUT
        console.log('ข้อมูลที่ส่งไป:', {
            id, // เพิ่ม id
            title,
            description,
            content,
            writer,
            category,
            file: file ? file.name : 'ไม่มีไฟล์',
        });
    
        setSubmitting(true);
    
        try {
            await axios.post(
                'http://localhost/BlogApi-v1/Server/editBlog.php',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            Swal.fire({
                title: "แจ้งเตือน",
                text: "อัปเดตบทความเรียบร้อยแล้ว",
                icon: "success",
            });
            navigate("/");
        } catch (err) {
            Swal.fire({
                title: "แจ้งเตือน",
                text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
                icon: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const showUpdateForm = () => (
        <form onSubmit={submitForm}>
            <div className="form-group">
                <label>ชื่อบทความ</label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={title}
                    onChange={inputValue("title")}
                    style={{ maxWidth: '200px', width: '100%' }}
                    required
                />
            </div>
            <div className="form-group">
                <label>รายละเอียด</label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={description}
                    onChange={inputValue("description")}
                    style={{ maxWidth: '200px', width: '100%' }}
                    required
                />
            </div>
            <div className="form-group">
                <label>อัปโหลดรูปภาพใหม่ (ถ้าต้องการ)</label>
                <input 
                    type="file" 
                    className="form-control" 
                    onChange={handleFileChange} 
                    style={{ maxWidth: '300px', width: '100%' }}
                />
                {imagePreview && (
                    <div className="mt-3">
                        <img 
                            src={imagePreview} 
                            alt="ภาพใหม่ที่เลือก" 
                            style={{ maxHeight: '400px' }} 
                        />
                    </div>
                )}
                {!imagePreview && oldImage && (
                    <div className="mt-3">
                        <img 
                            src={oldImage} 
                            alt="ภาพเดิม" 
                            style={{ maxHeight: '400px' }} 
                        />
                    </div>
                )}
            </div>
            <div className="form-group">
                <label>เนื้อหา</label>
                <ReactQuill 
                    value={content}
                    onChange={submitContent}
                    theme="snow"
                    className="pb-5 mb-3"
                    placeholder="เขียนรายละเอียดบทความของคุณ"
                    style={{ border: '1px solid #666', height: '400px' }}
                />
            </div>
            <div className="form-group">
                <label>นักเขียน</label>
                <select
                    id="writer"
                    name="writer"
                    value={writer}
                    onChange={inputValue("writer")}
                    className="form-control"
                    style={{ maxWidth: '120px', width: '100%' }}
                    required
                >
                    <option value="">เลือกนักเขียน</option>
                    {writers.map((wrt) => (
                        <option key={wrt.id} value={wrt.id}>
                            {wrt.writerName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>หมวดหมู่:</label>
                <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={inputValue("category")}
                    className="form-control"
                    style={{ maxWidth: '120px', width: '100%' }}
                    required
                >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>
            <br />
            <input 
                type="submit" 
                value="บันทึกการแก้ไข" 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ maxWidth: '150px', width: '100%' }}
            />
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <NavbarComponent />
            <div className="container p-5">
                <h1>แก้ไขบทความ</h1>
                {showUpdateForm()}
            </div>
        </>
    );
}

export default EditFormComponent;
