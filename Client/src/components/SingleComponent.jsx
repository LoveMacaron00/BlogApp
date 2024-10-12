import axios from 'axios';
import { useState, useEffect } from 'react';
import NavbarComponent from './NavbarComponent';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import Footer from './footer';

const SingleComponent = () => {
    const { id } = useParams();
    const [data, setData] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [writers, setWriters] = useState([]);
    const [selectedWriterId, setSelectedWriterId] = useState("");
    const [currentUserWriterId, setCurrentUserWriterId] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBlogData();
        fetchComments();
        fetchWriters();
    }, [id, token]);

    const fetchBlogData = () => {
        axios.get(`http://localhost/BlogApi-v1/Server/blog.php?id=${id}`)
            .then(response => {
                setData(response.data);
            })
            .catch(err => console.error('Error fetching blog:', err));
    };

    const fetchComments = () => {
        axios.get(`http://localhost/BlogApi-v1/Server/commentblog.php?id=${id}`)
            .then(response => {
                setComments(response.data);
            })
            .catch(err => console.error('Error fetching comments:', err));
    };

    const fetchWriters = () => {
        if (token) {
            axios.get(`http://localhost/BlogApi-v1/Server/getWriterUusr.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                setWriters(response.data);
                if (response.data.length > 0) {
                    setCurrentUserWriterId(response.data[0].id); // เก็บ writer_id ของผู้ใช้ที่ล็อกอินอยู่
                }
            })
            .catch(err => {
                console.error('Error fetching writers:', err);
                setError('ไม่สามารถโหลดนักเขียนได้');
            });
        } else {
            setError('ไม่พบ token');
        }
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim() === "") return alert("กรุณากรอกคอมเม้น");
        if (selectedWriterId === "") return alert("กรุณาเลือกผู้เขียน");

        const commentData = {
            blog_id: id,
            content: newComment,
            writer_id: selectedWriterId
        };

        axios.post(`http://localhost/BlogApi-v1/Server/commentblog.php`, commentData)
            .then(response => {
                fetchComments();
                setNewComment("");
                setSelectedWriterId("");
            })
            .catch(err => console.error('Error adding comment:', err));
    };

    const handleEditClick = (comment) => {
        if (comment.writer_id !== currentUserWriterId) { // ตรวจสอบว่า writer_id ตรงกันไหม
            alert("คุณไม่สามารถแก้ไขความคิดเห็นของผู้อื่นได้");
            return;
        }
        setEditCommentId(comment.id);
        setEditCommentContent(comment.content);
        setNewComment(comment.content);
    };

    const handleUpdateComment = (e) => {
        e.preventDefault();
        if (editCommentContent.trim() === "") return alert("กรุณากรอกคอมเม้น");

        axios.post(`http://localhost/BlogApi-v1/Server/editCommentblog.php`, {
            id: editCommentId,
            content: editCommentContent
        })
        .then(response => {
            fetchComments();
            setEditCommentId(null);
            setEditCommentContent("");
            setNewComment("");
        })
        .catch(err => console.error('Error updating comment:', err));
    };

    const handleDeleteComment = (comment) => {
        // ตรวจสอบว่า writer_id ของผู้ที่คอมเม้นต์ตรงกับ currentUserWriterId หรือไม่
        if (comment.writer_id !== currentUserWriterId) {
            alert("คุณไม่สามารถลบความคิดเห็นของผู้อื่นได้");
            return;
        }
    
        if (window.confirm("คุณแน่ใจว่าต้องการลบความคิดเห็นนี้?")) {
            axios.post(`http://localhost/BlogApi-v1/Server/deleteCommentblog.php`, {
                id: comment.id,
                action: 'delete'
            })
            .then(response => {
                setComments(comments.filter(c => c.id !== comment.id));
            })
            .catch(err => console.error('Error deleting comment:', err));
        }
    };

    return (
        <>
            <NavbarComponent />
            <div className='container p-5'>
                {data.title && (
                    <>
                        <h1 className='pt-3'>{data.title}</h1>
                        <div className="d-flex flex-column align-items-center pt-3">
                            <p className="text-title">
                                เผยแพร่ : {new Date(data.created_at).toLocaleString()} 
                                <span style={{ margin: "0 10px" }}> | </span>
                                อัพเดต : {new Date(data.updated_at).toLocaleString()}
                            </p>
                            <p className="text-title">
                            👁‍🗨 : {data.view} by : {data.writerName}
                            </p>
                        </div>
                        <img 
                            src={data.image_url} 
                            alt={data.title} 
                            style={{ width: '100%', height: 'auto', maxHeight: '100vh', objectFit: 'cover' }} 
                        />
                        <div className='pt-5'>{parse(data.content)}</div>
                    </>
                )}

                {/* ส่วนแสดงคอมเม้น */}
                <div className="comments-section pt-5">
                    <h3>ความคิดเห็น</h3>
                    {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-box p-3 my-2" style={{ border: '1px solid #ccc', borderRadius: '5px', maxWidth: '500px', width: '100%' }}>
                            <p>{comment.content}</p>
                            <small>โดย {comment.writerName} เมื่อ {new Date(comment.created_at).toLocaleString()}</small>
                            <br />
                            {comment.writer_id === currentUserWriterId && (
                                <>
                                    <button 
                                        className="btn btn-secondary btn-sm mt-2" 
                                        style={{ maxWidth: '150px', width: '100%' }}
                                        onClick={() => handleEditClick(comment)}
                                    >
                                        แก้ไข
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm mt-2 ms-2" 
                                        style={{ maxWidth: '150px', width: '100%' }}
                                        onClick={() => handleDeleteComment(comment)}  // ส่งออบเจกต์ comment แทน
                                    >
                                        ลบ
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>ยังไม่มีความคิดเห็น</p>
                )}
                </div>

            {/* กล่องคอมเม้น */}
            {token && currentUserWriterId ? (
                <div className="comment-form pt-4">
                    <h4>{editCommentId ? "แก้ไขความคิดเห็น" : "แสดงความคิดเห็น"}</h4>
                    <form onSubmit={editCommentId ? handleUpdateComment : handleCommentSubmit}>
                        <textarea 
                            className="form-control mb-3" 
                            rows="4" 
                            value={editCommentId ? editCommentContent : newComment} 
                            onChange={(e) => editCommentId ? setEditCommentContent(e.target.value) : setNewComment(e.target.value)} 
                            placeholder="กรอกความคิดเห็นของคุณที่นี่..."
                            style={{ maxWidth: '500px', width: '100%' }}
                        />
                        
                        {!editCommentId && (
                            <select className="form-select mb-3" style={{ maxWidth: '140px', width: '100%' }} value={selectedWriterId} onChange={(e) => setSelectedWriterId(e.target.value)}>
                                <option value="">เลือกผู้เขียน</option>
                                {writers.map(writer => (
                                    <option key={writer.id} value={writer.id}>{writer.writerName}</option>
                                ))}
                            </select>
                        )}

                        <button className="btn btn-primary" style={{ maxWidth: '110px', width: '100%' }} type="submit">
                            {editCommentId ? "อัพเดตความคิดเห็น" : "ส่งความคิดเห็น"}
                        </button>
                        {error && <p className="text-danger">{error}</p>}
                    </form>
                </div>
            ) : (
                <p className="text-warning">คุณต้องล็อกอินก่อนจึงจะแสดงความคิดเห็นได้</p>
            )}
            </div>
            <Footer />
        </>
    );
};

export default SingleComponent;