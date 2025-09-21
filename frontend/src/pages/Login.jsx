import React, { useState, useContext } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const res = await api.post("/users/login", { email, password }); // adjust if your backend route is different
            const token = res.data.token ?? res.data; // accommodate different responses
            login(token);
            navigate("/dashboard");
        } catch (error) {
            setErr(error?.response?.data?.message ?? "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold text-reward mb-4 text-center">Login</h2>
                <form onSubmit={submit} className="space-y-4">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email"
                        className="w-full p-3 rounded-lg bg-background border border-[#ffffff12]" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"
                        className="w-full p-3 rounded-lg bg-background border border-[#ffffff12]" />
                    <button type="submit" className="btn-primary w-full">Login</button>
                    {err && <p className="text-sm text-[#ffb0b0]">{err}</p>}
                </form>
                <p className="text-center text-sm mt-4">New here? <Link to="/signup" className="text-accent">Create account</Link></p>
            </div>
        </div>
    );
}
