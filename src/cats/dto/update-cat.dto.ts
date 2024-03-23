import { PartialType } from '@nestjs/mapped-types';
import { CreateCatDto } from './create-cat.dto';

export class UpdateCatDto extends PartialType(CreateCatDto){
    // @IsString()
    // @MinLength(1)
    // @IsOptional()
    // name?: string;

    // @IsInt()
    // @IsPositive()
    // @IsOptional()
    // age?: number;

    // @IsString()
    // @IsOptional()
    // breed?: string;
}
