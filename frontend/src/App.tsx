import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import KanbanBoard from "./pages/KanbanBoardPage";
import CreateProject from "./pages/CreateProject";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kanbanBoard/:projectId" element={<KanbanBoard />} />
        <Route path="/createProject" element={<CreateProject />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
