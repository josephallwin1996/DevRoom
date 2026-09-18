import {
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  @Length(1, 2000)
  content!: string;
}