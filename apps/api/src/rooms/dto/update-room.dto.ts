import { IsString, Length } from 'class-validator';

export class UpdateRoomDto {
  @IsString()
  @Length(1, 100)
  name!: string;
}