import { environment } from "@raycast/api";
import fs from "fs";
import path from "path";
import { MenuItem } from "../types";

const STORAGE_FILE = path.join(environment.supportPath, "which-key-data.json");

export function getStorageFilePath(): string {
  return STORAGE_FILE;
}

export async function loadMenuItems(): Promise<MenuItem[]> {
  if (!fs.existsSync(STORAGE_FILE)) {
    return [];
  }
  const data = fs.readFileSync(STORAGE_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveMenuItems(items: MenuItem[]) {
  const data = JSON.stringify(items, null, 2);
  fs.writeFileSync(STORAGE_FILE, data);
}

function findItemById(items: MenuItem[], id: string): [MenuItem | undefined, MenuItem[] | undefined] {
  for (const item of items) {
    if (item.id === id) {
      return [item, items];
    }
    if (item.children) {
      const [foundItem, parent] = findItemById(item.children, id);
      if (foundItem) {
        return [foundItem, parent];
      }
    }
  }
  return [undefined, undefined];
}

export async function addMenuItem(parentId: string | null, newItem: MenuItem) {
  const items = await loadMenuItems();
  if (parentId === null) {
    items.push(newItem);
  } else {
    const [parent] = findItemById(items, parentId);
    if (parent && parent.type === "menu") {
      parent.children = parent.children || [];
      parent.children.push(newItem);
    }
  }
  await saveMenuItems(items);
}

export async function updateMenuItem(updatedItem: MenuItem) {
  const items = await loadMenuItems();
  const [item] = findItemById(items, updatedItem.id);
  if (item) {
    Object.assign(item, updatedItem);
    await saveMenuItems(items);
  }
}

export async function removeMenuItem(id: string) {
  const items = await loadMenuItems();
  const [, parent] = findItemById(items, id);
  if (parent) {
    const index = parent.findIndex((item) => item.id === id);
    if (index !== -1) {
      parent.splice(index, 1);
      await saveMenuItems(items);
    }
  }
}

export async function updateMenuItemsOrder(parentId: string | null, orderedIds: string[]) {
  const items = await loadMenuItems();
  const [parent] = parentId ? findItemById(items, parentId) : [{ children: items }, undefined];
  if (parent && parent.children) {
    parent.children = orderedIds
      .map((id) => parent.children!.find((item) => item.id === id))
      .filter((item): item is MenuItem => item !== undefined);
    await saveMenuItems(items);
  }
}
