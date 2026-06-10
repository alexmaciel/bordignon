import { MenuComponent, ScrollComponent } from "./components";

const menuReinitialization = () => {
  setTimeout(() => {
    MenuComponent.reinitialization();
    ScrollComponent.reinitialization();
  }, 50);
}

export { menuReinitialization }
