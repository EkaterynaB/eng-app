import { NavLink, Route, Routes } from "react-router-dom";
import { SentenceManagementPage } from "./pages/SentenceManagementPage";
import { PracticePage } from "./pages/PracticePage";

export function App() {
  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-title">English Practice</span>
        <div className="app-nav-links">
          <NavLink to="/" end>
            Sentences
          </NavLink>
          <NavLink to="/practice">Practice</NavLink>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SentenceManagementPage />} />
          <Route path="/practice" element={<PracticePage />} />
        </Routes>
      </main>
    </div>
  );
}
