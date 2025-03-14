// src/products/dto/product-response.dto.ts
export class Cms_ResponseProductDto {
  id: string;
  catalog_id?: string;
  eCatalogURL?: string;
  name: string;
  slug?: string;
  category_id: string;
  category: {
    name: string;
  };
  descriptions: {
    descriptions: string;
    benefits: string;
  };
  images: {
    imageURL: string;
    isPrimary: boolean;
  }[];

  primaryImageURL?: string | null;
}
