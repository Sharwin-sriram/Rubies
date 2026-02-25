import { Icon } from "@iconify/react";
import style from "@styles/Navbar.module.css";
import { useNavigate } from "react-router";

export default () => {
  const navigate = useNavigate();
  const navBar = [
    { title: "Home", to: "/shop" },
    { title: "IEMS", to: "/iems" },
    { title: "Budget friendly", to: "/budget" },
    { title: "Over ears", to: "/over-ears" },
  ];
  const size = 32;
  const color = "white";

  return (
    <header className={style.NavBar}>
      <div className={style.logo}>
        <h4>RUBIES</h4>
      </div>
      <nav className={style.nav}>
        {navBar.map((navItem, index) => {
          const { title, to } = navItem;
          return (
            <a href={to} key={index} onClick={(e) => {
              e.preventDefault();
              navigate(to);
            }}>
              {title}
            </a>
          );
        })}
      </nav>
      <div className={style.RightSection}>
        <button className={style.profile}>
          <Icon
            icon={"lucide:user-round"}
            width={size}
            height={size}
            color={color}
          />
        </button>
        <button className={style.cart}>
          <Icon
            icon={"lucide:shopping-cart"}
            width={size}
            height={size}
            color={color}
          />
        </button>
      </div>
    </header>
  );
};
