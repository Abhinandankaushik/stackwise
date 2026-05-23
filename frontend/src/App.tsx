import { Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { SharePage } from "./pages/SharePage";
import { WidgetPage } from "./pages/WidgetPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/a/:slug" element={<SharePage />} />
      <Route path="/widget" element={<WidgetPage />} />
    </Routes>
  );
}
