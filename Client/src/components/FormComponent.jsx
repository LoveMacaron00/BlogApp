import { useState, useEffect } from 'react';
import NavbarComponent from "./NavbarComponent";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FormComponent = () => {
    const [state, setState] = useState({
        title: "",
        description: "",
        writer: "",
        category: "",
    });
    const { title, description, writer, category } = state;

    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [writers, setWriters] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost/BlogApi-v1/Server/getCategory.php');
                setCategories(response.data);
            } catch (error) {
                setError('ไม่สามารถโหลดหมวดหมู่ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (!token) {
            setError('ไม่พบ token');
            return;
        }

        const fetchWriters = async () => {
            try {
                const response = await axios.get('http://localhost/BlogApi-v1/Server/getWriterUusr.php', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setWriters(response.data);
            } catch (error) {
                setError('ไม่สามารถโหลดนักเขียนได้');
            }
        };

        fetchWriters();
    }, [token]);

    const inputValue = name => event => {
        setState({ ...state, [name]: event.target.value });
    }

    const submitContent = (content) => {
        console.log(content);
        setContent(content);
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // สร้าง URL ชั่วคราวสำหรับแสดง preview
        const imageUrl = URL.createObjectURL(selectedFile);
        setImagePreviewUrl(imageUrl);
    };

    const validateForm = () => {
        if (!title || !description || !content || !writer || !category) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return false;
        }
        return true;
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!token) {
            setError('ไม่พบ token');
            return;
        }

        const formData = new FormData();
        formData.append('title', title || '');
        formData.append('description', description || '');
        formData.append('content', content || '');
        formData.append('writer', writer || '');
        formData.append('category_id', category || '');
        if (file) {
            formData.append('image', file);
        }

        try {
            const response = await axios.post(
                'http://localhost/BlogApi-v1/Server/getUserBlogs.php',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            Swal.fire({
                title: "สำเร็จ",
                text: "บันทึกข้อมูลบทความเรียบร้อย",
                icon: "success",
            });
            setState({ title: "", description: "", writer: "", category: "" });
            setContent("");
            setFile(null);
            setImagePreviewUrl(null);  // เคลียร์รูปภาพหลังการบันทึก
            navigate("/");
        } catch (err) {
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                icon: "error",
            });
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <NavbarComponent />
            <div className="container p-5">
                <h1>เขียนบทความ</h1>
                <form onSubmit={submitForm}>
                    <div className="form-group">
                        <label>ชื่อบทความ</label>
                        <input type="text" className="form-control" 
                            value={title} 
                            onChange={inputValue("title")}
                            placeholder="กรอกชื่อบทความ"
                            style={{ maxWidth: '200px', width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>รายละเอียด</label>
                        <input type="text" className="form-control" 
                            value={description} 
                            onChange={inputValue("description")}
                            placeholder="กรอกรายละเอียด"
                            style={{ maxWidth: '200px', width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>อัปโหลดรูปภาพ</label>
                        <input type="file" className="form-control" style={{ maxWidth: '300px', width: '100%' }} onChange={handleFileChange} />
                        {imagePreviewUrl && (  // แสดง preview ของรูปภาพที่ถูกอัปโหลด
                            <div className="mt-3">
                                <img src={imagePreviewUrl} alt="Preview" style={{ maxHeight: '400px' }} />
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
                            {[...new Map(writers.map(writer => [writer.writer, writer])).values()].map((writer) => (
                                <option key={writer.id} value={writer.id}>
                                    {writer.writerName}
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
                    <input type="submit" value="บันทึก" className="btn btn-primary"/>
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                </form>
            </div>
        </>
    );
}

export default FormComponent;
