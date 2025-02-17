import { IsArray, IsString } from 'class-validator';

export class TicketAnalizerDto {
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsString()
  summary: string;
}
