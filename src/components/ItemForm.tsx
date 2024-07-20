import { Form, ActionPanel, Action, useNavigation } from "@raycast/api";
import { MenuItem } from "../types";
import { IconDropdown } from "./IconDropdown";

interface ItemFormProps {
  item?: MenuItem;
  onSubmit: (values: Partial<MenuItem>) => void;
}

export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const { pop } = useNavigation();
  const isEditing = !!item;
  const title = isEditing ? "Edit Item" : "Add Item";

  const handleSubmit = (values: Partial<MenuItem>) => {
    onSubmit(values);
    pop();
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title={title} onSubmit={handleSubmit} />
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
