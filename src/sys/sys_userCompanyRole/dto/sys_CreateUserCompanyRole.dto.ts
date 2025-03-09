import { IsBoolean, IsInt, IsString, Length } from 'class-validator';

export class Sys_CreateUserCompanyRoleDto {
  @IsInt()
  user_id: number;

  @IsString()
  // @Length(4, 4, { message: 'company_id harus 5 karakter' })
  company_id: string;

  @IsString()
  // @Length(4, 4, { message: 'branch_id harus 10 karakter' })
  branch_id: string;

  @IsString()
  role_id: string;

  @IsBoolean()
  isDefault: boolean;
}
