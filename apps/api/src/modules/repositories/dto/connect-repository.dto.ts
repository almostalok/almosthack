import { IsNotEmpty, IsString } from 'class-validator';
import { ConnectRepositorySchema } from '@almosthack/validation';

export class ConnectRepositoryDto implements ConnectRepositorySchema {
  @IsNotEmpty()
  @IsString()
  owner!: string;

  @IsNotEmpty()
  @IsString()
  repo!: string;
}
