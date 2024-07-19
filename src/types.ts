export interface MenuItem {
  id: string;
  type: "menu" | "action";
  title: string;
  shortcut?: string;
  action?: string;
  icon?: string;
  children?: MenuItem[];
}
