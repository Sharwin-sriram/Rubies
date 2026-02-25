import Navbar from "@components/LandingNavbar";
import { Icon } from "@iconify/react";
import style from "@styles/pages/Landing.module.css";
import SplitText from "@ui/SplitText.jsx";
import BlurText from "@ui/BlurText";
import { redirect, useNavigate } from "react-router";

export default () => {
  const small = 20;
  const full = 32;
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <section className={style.landing}>
        <div className={style.Hero}>
          <div>
            <BlurText text={"Hear the Difference"} delay={400} />
          </div>
          <button onClick={() => navigate("/shop")}>
            <SplitText text={"Explore"} />
            <Icon icon={"lucide:arrow-right"} width={full} height={full} />
          </button>
        </div>
        <div className={style.help}>
          <button className={style.helpBox}>
            <Icon
              icon={"material-symbols:help-outline-rounded"}
              width={small}
              height={small}
            />
            <h6>Help</h6>
          </button>
        </div>
      </section>
    </>
  );
};
