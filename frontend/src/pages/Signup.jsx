import React, { useState, useContext } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";

export default function Signup() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const res = await api.post("/users/register", { name, email, password });
            const token = res.data.token ?? res.data;
            login(token);
            navigate("/dashboard");
        } catch (error) {
            setErr(error?.response?.data?.message ?? "Sign up failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold text-reward mb-4 text-center">Create account</h2>
                <form onSubmit={submit} className="space-y-4">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-3 rounded-lg bg-background border border-[#ffffff12]" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-lg bg-background border border-[#ffffff12]" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg bg-background border border-[#ffffff12]" />
                    <button type="submit" className="btn-primary w-full">Sign up</button>
                    {err && <p className="text-sm text-[#ffb0b0]">{err}</p>}
                </form>
                <p className="text-center text-sm mt-4">Already have an account? <Link to="/login" className="text-accent">Login</Link></p>
            </div>
        </div>
    );
}
