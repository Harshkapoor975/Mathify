export default function ProgressBar({ label, value, max, accent }) {
    const percent = Math.min((value / max) * 100, 100);

    return (
        <div className="progress-bar">
            <div className="progress-meta">
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percent}%`, background: accent }} />
            </div>
        </div>
    );
}
