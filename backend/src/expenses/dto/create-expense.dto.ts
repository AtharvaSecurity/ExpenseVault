import { IsDateString, IsNumber, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @IsDateString()
  date: string;
}
