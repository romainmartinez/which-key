import { Form, Icon } from "@raycast/api";

interface IconDropdownProps {
  id: string;
  title: string;
  defaultValue?: string;
}

export function IconDropdown({ id, title, defaultValue }: IconDropdownProps) {
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
