import { IsString, Length } from 'class-validator'; 
export class AddRoomMemberDto {
     @IsString() 
     @Length(3, 30) 
     username!: string; 
}