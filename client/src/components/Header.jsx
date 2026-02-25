import { Icon } from "@iconify/react";
import style from "@styles/Header.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default ({ search, setSearch }) => {
  const navigate = useNavigate();
  const navItems = [
    { title: "categories" },
    { title: "On Sale", to: "" },
    { title: "Brands", to: "" },
  ];
  const [expanded, setExpanded] = useState(false);
  const [typing, setTyping] = useState(false);
  const size = 24;
  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(true);
  };

  const toProfile = () => {
    navigate("/profile");
  };

  const toCart = () => {
    navigate("cart");
  };

  useEffect(() => {
    // TODO: FIX CLOSING BUG IN SEARCH
    // SEARCH BAR CLOSES TOO SOON EVEN WHEN TYPED
    const close = () => setExpanded(false);
    if (!search && expanded) {
      window.addEventListener("click", close);
    }
    return () => window.removeEventListener("click", close);
  }, [expanded, search]);

  return (
    <header className={style.header}>
      <div className={style.logo}>
        <h4>RUBIS</h4>
      </div>
      <div className={style.quickLinks}>
        {navItems.map((item, index) => {
          const { title, to } = item;
          return (
            <a href={to} key={index + 69}>
              {title}
            </a>
          );
        })}
      </div>
      <div className={style.RightSect}>
        <button
          className={`${style.searchWrapper} ${expanded ? style.expanded : ""}`}
          onClick={(e) => handleExpand(e)}
        >
          <input
            type="text"
            className={style.searchBox}
            onChange={(e) => {
              setTyping(true);
              setTimeout(() => {
                setSearch(e.target.value);
                if (!search) setTyping(false);
              }, 1000);
            }}
          />

          <Icon
            icon={"lucide:search"}
            className={style.icon}
            width={size}
            height={size}
          />
        </button>
        <button className={style.profile} onClick={toProfile}>
          <Icon icon={"lucide:user-round"} width={size} height={size} />
        </button>
        <button className={style.cart} onClick={toCart}>
          <Icon icon={"lucide:shopping-cart"} width={size} height={size} />
        </button>
      </div>
    </header>
  );
};
