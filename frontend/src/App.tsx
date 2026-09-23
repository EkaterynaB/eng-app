import { NavLink, Route, Routes } from "react-router-dom";
import { PracticePage } from "./pages/PracticePage";
import { PracticeListsPage } from "./pages/PracticeListsPage";
import { PracticeListDetailPage } from "./pages/PracticeListDetailPage";

export function App() {
  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-title">English Practice</span>
        <div className="app-nav-links">
          <NavLink to="/" end>
            Lists
          </NavLink>
          <NavLink to="/practice">Practice</NavLink>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PracticeListsPage />} />
          <Route path="/lists/:id" element={<PracticeListDetailPage />} />
          <Route path="/practice" element={<PracticePage />} />
        </Routes>
      </main>
    </div>
  );
}
