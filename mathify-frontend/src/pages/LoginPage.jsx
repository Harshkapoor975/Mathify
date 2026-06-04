import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LoginPage({ onSuccess, onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            onSuccess(data.data.token, data.data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page login-page">
            <div className="card">
                <h2 className="card-title">Welcome back</h2>
                <p className="card-sub">Log in to Mathify</p>

                {error && <div className="error-box">{error}</div>}

                <form className="form" onSubmit={handleSubmit}>
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        required
                    />
                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <p className="switch-text">
                    No account? <button className="link-btn" type="button" onClick={onSwitch}>Sign up</button>
                </p>
            </div>
        </div>
    );
}
