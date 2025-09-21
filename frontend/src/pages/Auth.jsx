import { useState, useContext } from "react";
import api from "../api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true); // toggle between login/signup
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                const res = await api.post("/users/login", {
                    email: formData.email,
                    password: formData.password,
                });
                const token = res.data.token;
                if (token) {
                    login(token);
                    navigate("/dashboard");
                }
            } else {
                const res = await api.post("/users/register", {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
                const token = res.data.token;
                if (token) {
                    login(token);
                    navigate("/dashboard");
                }
            }
        } catch (err) {
            console.error("Auth error", err);
            setError(err?.response?.data?.message || "Auth failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#111827] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#081122] p-6 rounded-2xl border border-blue-700 shadow-lg">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">{isLogin ? "Welcome back" : "Create an account"}</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {!isLogin && (
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-3 rounded-lg bg-[#0b1220] border border-[#ffffff12] text-white" />
                    )}
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-3 rounded-lg bg-[#0b1220] border border-[#ffffff12] text-white" />
                    <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Password" className="w-full p-3 rounded-lg bg-[#0b1220] border border-[#ffffff12] text-white" />
                    <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold">{isLogin ? "Login" : "Sign up"}</button>
                </form>

                {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

                <p className="text-gray-400 text-center mt-4">
                    {isLogin ? "New to Evolv?" : "Already have an account?"}{" "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 font-semibold">
                        {isLogin ? "Create Account" : "Login"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
