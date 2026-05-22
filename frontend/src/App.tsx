import { Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { SharePage } from "./pages/SharePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/a/:slug" element={<SharePage />} />
    </Routes>
  );
}
