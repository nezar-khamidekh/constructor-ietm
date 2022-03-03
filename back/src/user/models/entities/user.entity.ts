import { RefreshTokenEntity } from 'src/auth/models/entities/refresh-token.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @BeforeInsert()
  doSomeMagic() {
    this.email = this.email.toLocaleLowerCase();
    this.username = this.login;
    this.login = this.login.toLocaleLowerCase();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  login: string;

  @Column({ length: 125, nullable: true })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ length: 125 })
  firstName: string;

  @Column({ length: 125 })
  lastName: string;

  @CreateDateColumn({ select: false })
  creationTime: string;

  @UpdateDateColumn({ select: false })
  updateTime: string;

  @OneToMany((type) => RefreshTokenEntity, (refresh) => refresh.user)
  refresh_tokens: RefreshTokenEntity[];
}
