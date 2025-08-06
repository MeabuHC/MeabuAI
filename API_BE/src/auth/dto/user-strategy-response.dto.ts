import { Role } from '../../common/enums';

export class UserStrategyResponseDto {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
