import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CodeIssue {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsNumber()
  line?: number;

  @IsOptional()
  @IsString()
  severity?: 'critical' | 'major' | 'minor' | 'info';

  @IsOptional()
  @IsString()
  category?: string;
}

export class CodeSuggestion {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsNumber()
  line?: number;

  @IsOptional()
  @IsString()
  codeExample?: string;
}

export class GitReview {
  @IsString()
  summary: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeIssue)
  issues: CodeIssue[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeSuggestion)
  suggestions: CodeSuggestion[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rating?: number;

  @IsArray()
  @IsString({ each: true })
  changesReview: string[];

  @IsOptional()
  @IsString()
  overallAssessment?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  focusAreaAnalysis?: string[];

  @IsOptional()
  @IsString()
  reviewDetailLevel?: 'basic' | 'standard' | 'thorough';
}
