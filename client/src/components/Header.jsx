import { Icon } from "@iconify/react";
import style from "@styles/Header.module.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

export default ({ search, setSearch }) => {
  const navigate = useNavigate();
  const navItems = [
    { title: "categories", to: "/categories" },
    { title: "On Sale", to: "/sale" },
    { title: "Brands", to: "/brands" },
  ];
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const timeoutRef = useRef(null);
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
    const close = () => setExpanded(false);
    if (expanded && !localSearch) {
      window.addEventListener("click", close);
    }
    return () => window.removeEventListener("click", close);
  }, [expanded, localSearch]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <header className={style.header}>
      <div className={style.logo}>
        <h4>RUBIS</h4>
      </div>
      <div className={style.quickLinks}>
        {navItems.map((item, index) => {
          const { title, to } = item;
          return (
            <a href={to} key={index + 69} onClick={(e) => {
              e.preventDefault();
              navigate(to);
            }}>
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
              const value = e.target.value;
              setLocalSearch(value);
              
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              timeoutRef.current = setTimeout(() => {
                setSearch(value);
              }, 500);
            }}
            value={localSearch}
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
