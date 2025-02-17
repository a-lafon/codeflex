import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class GitReviewDto {
  @IsString()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  issues: string[];

  @IsArray()
  @IsString({ each: true })
  suggestions: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsArray()
  @IsString({ each: true })
  changesReview: string[];
}
