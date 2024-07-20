import { Action, ActionPanel, List, Icon, Keyboard } from "@raycast/api";
import { GlobalActions } from "./components/GlobalActions";
import { ItemForm } from "./components/ItemForm";
import { useMenuItems } from "./hooks/useMenuItems";
import { MenuItem } from "./types";
import { getItemIcon } from "./utils/iconUtils";
import { renderShortcutAction } from "./utils/shortcutUtils";

export default function ShowMenu({ parentId = null }: { parentId?: string | null }) {
  const { items, addItem, editItem, removeItem, moveItem, sortAlphabetically, reloadFromStorage } =
    useMenuItems(parentId);

  function renderItem(item: MenuItem) {
    return (
      <List.Item
        key={item.id}
        title={item.title}
        icon={getItemIcon(item)}
        accessories={[{ text: item.shortcut }]}
        actions={
          <ActionPanel>
            {renderShortcutAction(item, { modifiers: [], key: "return" })}
            <ActionPanel.Section title="Items shortcuts">
              {items.map((item: MenuItem) => renderShortcutAction(item))}
            </ActionPanel.Section>
            <ActionPanel.Section title="Item actions">
              <Action.Push
                title="Edit Item"
                target={<ItemForm item={item} onSubmit={(values) => editItem(item, values)} />}
                icon={getItemIcon(item)}
              />
              <Action title="Remove Item" onAction={() => removeItem(item)} />
              <Action title="Move Up" onAction={() => moveItem(item, "up")} />
              <Action title="Move Down" onAction={() => moveItem(item, "down")} />
            </ActionPanel.Section>
            <GlobalActions
              onAddItem={() => <ItemForm onSubmit={addItem} />}
              onSortAlphabetically={sortAlphabetically}
              onReloadFromStorage={reloadFromStorage}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List
      navigationTitle={"Menu"}
      actions={
        <ActionPanel>
          <Action.Push
            title="Add Item"
            target={<ItemForm onSubmit={addItem} />}
            icon={Icon.Plus}
            shortcut={Keyboard.Shortcut.Common.New}
          />
          <Action title="Sort Alphabetically" onAction={sortAlphabetically} icon={Icon.Filter} />
          <Action title="Reload From Storage" onAction={reloadFromStorage} icon={Icon.RotateClockwise} />
        </ActionPanel>
      }
      isShowingDetail={false}
    >
      {items.map(renderItem)}
    </List>
  );
}
