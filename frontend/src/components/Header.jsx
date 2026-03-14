export default function Header({ userId, setUserId, onLoad }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-leaf">🌿</span>
          <span className="logo-text">ArvyaX</span>
        </div>
        <div className="user-bar">
          <input
            type="text"
            placeholder="your name..."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLoad()}
          />
          <button className="btn-load" onClick={onLoad}>
            Load Journal
          </button>
        </div>
      </div>
    </header>
  );
}