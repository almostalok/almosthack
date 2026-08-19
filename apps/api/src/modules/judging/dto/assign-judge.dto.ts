import { IsNotEmpty, IsUUID } from 'class-validator';
import { AssignJudgeSchema } from '@almosthack/validation';

export class AssignJudgeDto implements AssignJudgeSchema {
  @IsNotEmpty()
  @IsUUID()
  judgeUserId!: string;

  @IsNotEmpty()
  @IsUUID()
  submissionId!: string;
}
