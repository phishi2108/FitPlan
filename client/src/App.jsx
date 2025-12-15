import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PlanDetails from "./pages/PlanDetails";
import TrainerDashboard from "./pages/TrainerDashboard";
import Feed from "./pages/Feed"; // <--- IMPORT THIS

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plan/:id" element={<PlanDetails />} />
        <Route path="/dashboard" element={<TrainerDashboard />} />

        {/* ADD THIS ROUTE */}
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
