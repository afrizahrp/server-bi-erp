import { IsInt, IsString, Length } from 'class-validator';

export class Sys_UpdateUserCompanyRoleDto {
  @IsInt()
  user_id: number;

  @IsString()
  // @Length(3, 3, { message: 'company_id harus 5 karakter' })
  company_id: string;

  @IsString()
  // @Length(3, 3, { message: 'branch_id harus 10 karakter' })
  branch_id: string;

  @IsString()
  role_id: string;
}
