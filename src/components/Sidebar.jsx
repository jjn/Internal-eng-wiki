export default function Sidebar({ pages, activePage }) {
  const categories = [...new Set(pages.map((p) => p.category))];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span>📖</span> Eng Wiki
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <div className="sidebar-section">{cat}</div>
          {pages
            .filter((p) => p.category === cat)
            .map((page) => (
              <a
                key={page.id}
                className={`sidebar-link ${activePage === page.id ? "active" : ""}`}
              >
                {page.title}
              </a>
            ))}
        </div>
      ))}

      <div className="sidebar-section">Services</div>
      <a className="sidebar-link">API Gateway</a>
      <a className="sidebar-link">User Service</a>
      <a className="sidebar-link">Notification Service</a>

      <div className="sidebar-section">Guides</div>
      <a className="sidebar-link">On-Call Handbook</a>
      <a className="sidebar-link">Incident Response</a>
    </nav>
  );
}
