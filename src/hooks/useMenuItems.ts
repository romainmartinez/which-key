import { showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { addMenuItem, loadMenuItems, removeMenuItem, updateMenuItem, updateMenuItemsOrder } from "../services/storage";
import { MenuItem } from "../types";

export function useMenuItems(parentId: string | null) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadMenuItems().then((allItems) => {
      const currentItems = parentId === null ? allItems : findItemById(allItems, parentId)?.children || [];
      setItems(currentItems);
    });
  }, [parentId]);

  async function addItem(values: Partial<MenuItem>) {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      type: values.action ? "action" : "menu",
      title: values.title!,
      shortcut: values.shortcut!,
      action: values.action,
      icon: values.icon,
      children: [],
    };

    await addMenuItem(parentId, newItem);
    setItems((prevItems) => [...prevItems, newItem]);
    await showToast(Toast.Style.Success, "Item added successfully");
  }

  async function editItem(itemToEdit: MenuItem, values: Partial<MenuItem>) {
    const updatedItem: MenuItem = {
      ...itemToEdit,
      ...values,
      type: values.action ? "action" : "menu",
    };
    await updateMenuItem(updatedItem);
    setItems((prevItems) => prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    await showToast(Toast.Style.Success, "Item updated successfully");
  }
  async function removeItem(itemToRemove: MenuItem) {
    await removeMenuItem(itemToRemove.id);
    setItems(items.filter((item) => item.id !== itemToRemove.id));
    await showToast(Toast.Style.Success, "Item removed successfully");
  }

  async function moveItem(item: MenuItem, direction: "up" | "down") {
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

  async function sortAlphabetically() {
    const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title));
    setItems(sortedItems);
    await updateMenuItemsOrder(
      parentId,
      sortedItems.map((item) => item.id),
    );
    await showToast(Toast.Style.Success, "Items sorted alphabetically");
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

  return { items, addItem, editItem, removeItem, moveItem, sortAlphabetically, reloadFromStorage };
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
