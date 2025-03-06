// src/products/dto/product-response.dto.ts
export class ResponseProductDescsDto {
  id: string;
  descriptions: string;
  benefits: string;
  createdBy?: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt: Date;
  company_id: string;
  branch_id: string;
}
