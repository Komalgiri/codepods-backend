import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import CreatePod from "./pages/CreatePod";
import PodOverview from "./pages/PodOverview";
import AuthCallback from "./pages/AuthCallback";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/create-pod" element={<CreatePod />} />
        <Route path="/pod/:id" element={<PodOverview />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
