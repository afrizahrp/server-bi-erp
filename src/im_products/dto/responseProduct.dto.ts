// src/products/dto/product-response.dto.ts
export class ResponseProductDto {
  id: string;
  register_id?: string;
  catalog_id?: string;
  name: string;
  category_id: string;
  subCategory_id: string;
  brand_id: string;
  iStatus: number;
  slug?: string;
  isMaterial: boolean;
  isService: boolean;
  isFinishing: boolean;
  isAccessories: boolean;
  iShowedStatus: boolean;
  uom_id?: string;
  createdBy?: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt: Date;
  company_id: string;
  branch_id: string;
}
