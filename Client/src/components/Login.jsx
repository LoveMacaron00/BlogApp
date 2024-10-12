import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import "./LoginRegister.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost/BlogApi-v1/Server/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      console.log(data);
      console.log(username);
      console.log(password);

      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        
        if (username === "admin" && password === "admin123") {
          navigate("/adminManager");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <>
      <NavbarComponent />
      <form onSubmit={handleSubmit} className="Login">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}

export default Login;
