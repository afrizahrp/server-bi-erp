export class MenuItemDto {
  title: string;
  href?: string;
  icon?: string;
  child?: MenuItemDto[];
  multi_menu?: MenuItemDto[];
  nested?: MenuItemDto[];
}
