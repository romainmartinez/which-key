import { Action, ActionPanel, Icon } from "@raycast/api";

interface GlobalActionsProps {
  onAddItem: () => void;
  onSortAlphabetically: () => void;
  onReloadFromStorage: () => void;
}

export function GlobalActions({ onAddItem, onSortAlphabetically, onReloadFromStorage }: GlobalActionsProps) {
  return (
    <ActionPanel.Section title="Global actions">
      <Action title="Add Item" onAction={onAddItem} icon={Icon.Plus} />
      <Action title="Sort Alphabetically" onAction={onSortAlphabetically} icon={Icon.Filter} />
      <Action title="Reload From Storage" onAction={onReloadFromStorage} icon={Icon.RotateClockwise} />
    </ActionPanel.Section>
  );
}
