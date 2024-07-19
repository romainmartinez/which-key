// v2
import { useState, useEffect } from "react";
import { ActionPanel, Action, List, Icon, Image, showToast, Toast, Form, Keyboard, showInFinder } from "@raycast/api";
import fs from "fs";
import { MenuItem } from "./types";
import {
  loadMenuItems,
  addMenuItem,
  removeMenuItem,
  updateMenuItem,
  getStorageFilePath,
  updateMenuItemsOrder,
} from "./storage";

function IconDropdown({ id, title, defaultValue }: { id: string; title: string; defaultValue?: string }) {
  return (
    <Form.Dropdown id={id} title={title} defaultValue={defaultValue}>
      {Object.keys(Icon).map((iconName) => (
        <Form.Dropdown.Item
          key={iconName}
          value={iconName}
          title={iconName}
          icon={Icon[iconName as keyof typeof Icon]}
        />
      ))}
    </Form.Dropdown>
  );
}

export default function ShowMenu({ parentId = null }: { parentId?: string | null }) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadMenuItems().then((allItems) => {
      const currentItems = parentId === null ? allItems : findItemById(allItems, parentId)?.children || [];
      setItems(currentItems);
    });
  }, [parentId]);

  async function handleAddItem(values: { title: string; shortcut: string; action?: string; icon?: string }) {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      type: values.action ? "action" : "menu",
      title: values.title,
      shortcut: values.shortcut,
      action: values.action,
      icon: values.icon,
    };

    await addMenuItem(parentId, newItem);
    setItems([...items, newItem]);
    await showToast(Toast.Style.Success, "Item added successfully");
  }

  async function handleEditItem(
    item: MenuItem,
    values: { title: string; shortcut: string; action?: string; icon?: string },
  ) {
    const updatedItem: MenuItem = {
      ...item,
      type: values.action ? "action" : "menu",
      title: values.title,
      shortcut: values.shortcut,
      action: values.action,
      icon: values.icon,
    };

    await updateMenuItem(updatedItem);
    setItems(items.map((i) => (i.id === item.id ? updatedItem : i)));
    await showToast(Toast.Style.Success, "Item updated successfully");
  }

  async function handleRemoveItem(itemToRemove: MenuItem) {
    await removeMenuItem(itemToRemove.id);
    setItems(items.filter((item) => item.id !== itemToRemove.id));
    await showToast(Toast.Style.Success, "Item removed successfully");
  }

  async function handleMoveItem(item: MenuItem, direction: "up" | "down") {
    const index = items.findIndex((i) => i.id === item.id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === items.length - 1)) {
      return; // Can't move further
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    setItems(newItems);
    await updateMenuItemsOrder(
      parentId,
      newItems.map((item) => item.id),
    );
    await showToast(Toast.Style.Success, `Item moved ${direction}`);
  }

  async function handleSortAlphabetically() {
    const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title));
    setItems(sortedItems);
    await updateMenuItemsOrder(
      parentId,
      sortedItems.map((item) => item.id),
    );
    await showToast(Toast.Style.Success, "Items sorted alphabetically");
  }

  async function viewStorageFile() {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      await showInFinder(filePath);
    } else {
      await showToast(Toast.Style.Failure, "Storage file not found");
    }
  }

  async function reloadFromStorage() {
    try {
      const allItems = await loadMenuItems();
      const currentItems = parentId === null ? allItems : findItemById(allItems, parentId)?.children || [];
      setItems(currentItems);
      await showToast(Toast.Style.Success, "Data reloaded from storage");
    } catch (error) {
      console.error("Failed to reload data:", error);
      await showToast(Toast.Style.Failure, "Failed to reload data from storage");
    }
  }

  function ItemForm({ item }: { item?: MenuItem }) {
    const isEditing = !!item;
    const title = isEditing ? "Edit Item" : "Add Item";
    const onSubmit = isEditing ? (values: any) => handleEditItem(item, values) : handleAddItem;

    return (
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm title={title} onSubmit={onSubmit} />
          </ActionPanel>
        }
        validation={{
          title: (value) => {
            if (!value) return "Title is required";
            return undefined;
          },
          shortcut: (value) => {
            if (!value) return "Shortcut is required";
            return undefined;
          },
        }}
      >
        <Form.TextField id="title" title="Title" defaultValue={item?.title} />
        <Form.TextField id="shortcut" title="Shortcut" defaultValue={item?.shortcut} />
        <IconDropdown id="icon" title="Icon" defaultValue={item?.icon} />
        <Form.TextField
          id="action"
          title="Action (Optional)"
          defaultValue={item?.action}
          placeholder="e.g., raycast://extensions/raycast/raycast/open-application?name=Spotify"
          description="Enter a Raycast deeplink or URL. Leave empty for a menu item."
        />
      </Form>
    );
  }

  function GlobalActions() {
    return (
      <>
        <ActionPanel.Section title="Global actions">
          <Action.Push
            title="Add Item"
            target={<ItemForm />}
            icon={Icon.Plus}
            shortcut={Keyboard.Shortcut.Common.New}
          />
          <Action title="Sort Alphabetically" onAction={handleSortAlphabetically} icon={Icon.Filter} />
          <Action title="View Storage File" onAction={viewStorageFile} icon={Icon.Eye} />
          <Action
            title="Reload From Storage"
            onAction={reloadFromStorage}
            icon={Icon.RotateClockwise}
            shortcut={Keyboard.Shortcut.Common.Refresh}
          />
        </ActionPanel.Section>
      </>
    );
  }
  function getItemIcon(item: MenuItem): Image.ImageLike {
    if (item.icon) {
      return Icon[item.icon as keyof typeof Icon];
    } else {
      return item.type === "menu" ? Icon.List : Icon.Circle;
    }
  }

  function renderShortcutAction(item: MenuItem, customShortcut?: Keyboard.Shortcut): JSX.Element | null {
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
          icon={getItemIcon(item)}
          shortcut={shortcut}
        />
      );
    } else if (item.type === "menu") {
      return (
        <Action.Push
          key={item.id}
          title={`Open ${item.title}`}
          target={<ShowMenu parentId={item.id} />}
          icon={Icon.List}
          shortcut={shortcut}
        />
      );
    }
    return null;
  }

  function renderItem(item: MenuItem, items: MenuItem[]) {
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
              <Action.Push title="Edit Item" target={<ItemForm item={item} />} icon={Icon.Pencil} />
              <Action
                title="Remove Item"
                onAction={() => handleRemoveItem(item)}
                icon={Icon.Trash}
                shortcut={Keyboard.Shortcut.Common.Remove}
              />
              <Action
                title="Move Up"
                onAction={() => handleMoveItem(item, "up")}
                icon={Icon.ArrowUp}
                shortcut={Keyboard.Shortcut.Common.MoveUp}
              />
              <Action
                title="Move Down"
                onAction={() => handleMoveItem(item, "down")}
                icon={Icon.ArrowDown}
                shortcut={Keyboard.Shortcut.Common.MoveDown}
              />
            </ActionPanel.Section>
            <GlobalActions />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List
      navigationTitle={parentId === null ? "Which Key Menu" : "Submenu"}
      actions={
        <ActionPanel>
          <GlobalActions />
        </ActionPanel>
      }
      isShowingDetail={false}
    >
      {items.map((item) => renderItem(item, items))}
    </List>
  );
}

function findItemById(items: MenuItem[], id: string): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
