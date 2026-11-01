import { NavLink, Route, Routes } from "react-router-dom";
import { PracticePage } from "./pages/PracticePage";
import { PracticeListsPage } from "./pages/PracticeListsPage";
import { PracticeListDetailPage } from "./pages/PracticeListDetailPage";
import { DialoguesPage } from "./pages/DialoguesPage";
import { DialogueCreatePage } from "./pages/DialogueCreatePage";
import { DialogueEditPage } from "./pages/DialogueEditPage";
import { DialogueDetailPage } from "./pages/DialogueDetailPage";
import { DialoguePracticePage } from "./pages/DialoguePracticePage";

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
          <NavLink to="/dialogues">Dialogues</NavLink>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PracticeListsPage />} />
          <Route path="/lists/:id" element={<PracticeListDetailPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/dialogues" element={<DialoguesPage />} />
          <Route path="/dialogues/new" element={<DialogueCreatePage />} />
          <Route path="/dialogues/:id" element={<DialogueDetailPage />} />
          <Route path="/dialogues/:id/edit" element={<DialogueEditPage />} />
          <Route path="/dialogues/:id/practice" element={<DialoguePracticePage />} />
        </Routes>
      </main>
    </div>
  );
}
