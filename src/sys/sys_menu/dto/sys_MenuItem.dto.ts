export class MenuItemDto {
  title: string;
  href?: string;
  icon?: string;
  module_id?: string;
  child?: MenuItemDto[];
  multi_menu?: MenuItemDto[];
  nested?: MenuItemDto[];
}
