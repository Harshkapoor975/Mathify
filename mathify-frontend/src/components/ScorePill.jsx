export default function ScorePill({ label, value, accent }) {
    return (
        <div className="score-pill" style={{ borderColor: accent }}>
            <span style={{ color: accent }}>{value}</span>
            <span>{label}</span>
        </div>
    );
}
