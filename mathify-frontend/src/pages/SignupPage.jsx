import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SignupPage({ onSuccess, onSwitch }) {
    const [form, setForm] = useState({ username: "", fullName: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            const loginResponse = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const loginData = await loginResponse.json();
            if (!loginResponse.ok) {
                throw new Error(loginData.message || "Signup succeeded but login failed");
            }

            onSuccess(loginData.data.token, loginData.data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page signup-page">
            <div className="card">
                <h2 className="card-title">Create account</h2>
                <p className="card-sub">Join Mathify</p>

                {error && <div className="error-box">{error}</div>}

                <form className="form" onSubmit={handleSubmit}>
                    <input className="input" name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
                    <input className="input" name="fullName" type="text" placeholder="Full name" value={form.fullName} onChange={handleChange} required />
                    <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                    <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Sign up"}
                    </button>
                </form>

                <p className="switch-text">
                    Already have an account? <button className="link-btn" type="button" onClick={onSwitch}>Log in</button>
                </p>
            </div>
        </div>
    );
}
