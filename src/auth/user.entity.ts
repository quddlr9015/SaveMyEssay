import { Board } from "@/boards/board.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    // eager: true는 유저 정보를 가져올때 게시물 정보도 가져오는 설정
    @OneToMany(type => Board, board => board.user, { eager: true })
    boards: Board[]
}