import HomePage from "@pages/HomePage";
import LandingPage from "@pages/LandingPage";
import { Route, Routes } from "react-router";

export default () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<HomePage />} />
      </Routes>
    </>
  );
};
