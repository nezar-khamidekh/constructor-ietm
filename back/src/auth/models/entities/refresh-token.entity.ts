import { UserEntity } from 'src/user/models/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  token: string;

  @Column('timestamp with time zone')
  expireDate: Date;

  @ManyToOne((type) => UserEntity, (user) => user.refresh_tokens, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  userId: number;
}
