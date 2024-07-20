import { Action, Keyboard } from "@raycast/api";
import ShowMenu from "../showMenu";
import { MenuItem } from "../types";
import { getItemIcon } from "./iconUtils";

export function renderShortcutAction(item: MenuItem, customShortcut?: Keyboard.Shortcut): JSX.Element | null {
  const shortcut: Keyboard.Shortcut = customShortcut || {
    modifiers: [],
    key: item.shortcut as Keyboard.KeyEquivalent,
  };

  if (item.type === "action" && item.action) {
    return (
      <Action.Open
        key={item.id}
        title={`Execute ${item.title}`}
        target={item.action}
        shortcut={shortcut}
        icon={getItemIcon(item)} // we could use getItemIcon(item) but I want this to be fast
      />
    );
  } else if (item.type === "menu") {
    return (
      <Action.Push
        key={item.id}
        title={`Open ${item.title}`}
        target={<ShowMenu parentId={item.id} />}
        shortcut={shortcut}
      />
    );
  }
  return null;
}
