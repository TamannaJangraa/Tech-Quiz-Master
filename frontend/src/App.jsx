import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import MyResults from "./pages/MyResults";
import Leaderboard from "./pages/leaderboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result" element={<Result />} />
      <Route path="/my-results" element={<MyResults />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default App;