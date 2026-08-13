export default function LocationButton({ label, active, onClick }) {
    return (
        <button onClick={onClick} className={`lieu-btn ${active ? 'lieu-btn-active' : ''}`}>
            {label}
        </button>
    );
}