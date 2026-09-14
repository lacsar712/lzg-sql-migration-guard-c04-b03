import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const HISTORY_DIALECTS = [
  'postgresql',
  'mysql',
  'mariadb',
  'sqlite',
  'transactsql',
] as const;

export class HistoryQueryDto {
  // 仅允许已知方言，未知值直接 400
  @IsOptional()
  @IsString()
  @IsIn(HISTORY_DIALECTS as unknown as string[])
  dialect?: string;

  // 布尔查询参数按字符串传入：'true' / 'false'
  @IsOptional()
  @IsIn(['true', 'false'])
  ok?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
