import { Icon, Image } from "@raycast/api";
import { MenuItem } from "../types";

export function getItemIcon(item: MenuItem): Image.ImageLike {
  if (item.icon) {
    return Icon[item.icon as keyof typeof Icon];
  } else {
    return Icon.Circle;
  }
}
