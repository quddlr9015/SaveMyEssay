import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AuthProvider {
    LOCAL = 'local',
    GOOGLE = 'google',
    GITHUB = 'github',
    FACEBOOK = 'facebook',
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true, unique: true })
    email: string;

    @Column({ nullable: true })
    profileImageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastLoginAt: Date;

    // 소셜 로그인 관련 필드
    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL
    })
    provider: AuthProvider;

    @Column({ nullable: true })
    providerId: string;

    @Column({ nullable: true })
    refreshToken: string;

    // 사용자 설정
    @Column({ type: 'json', nullable: true })
    preferences: {
        language: string;
        theme: 'light' | 'dark';
        notifications: {
            email: boolean;
            push: boolean;
        };
    };

    // 계정 상태
    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ nullable: true })
    emailVerificationTokenExpires: Date;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ nullable: true })
    resetPasswordExpires: Date;

    // Role field
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;
} 