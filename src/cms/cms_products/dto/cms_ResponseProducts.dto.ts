// src/products/dto/product-response.dto.ts
export class Cms_ResponseProductDto {
  id: string;
  catalog_id?: string;
  name: string;
  slug?: string;
  iShowedStatus: string;

  primaryImageURL?: string | null;
}
