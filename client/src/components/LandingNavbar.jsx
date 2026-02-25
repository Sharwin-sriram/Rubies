import { Icon } from "@iconify/react";
import style from "@styles/Navbar.module.css";

export default () => {
  const navBar = [
    { title: "Home", to: "" },
    { title: "IEMS", to: "" },
    { title: "Budget friendly", to: "" },
    { title: "Over ears", to: "" },
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
            <a href={to} key={index}>
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
