import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSampleAnswerColumn1747461690015 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE writing_question 
            ADD COLUMN sample_answer TEXT NOT NULL COMMENT '모범 답안' AFTER description
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE writing_question 
            DROP COLUMN sample_answer
        `);
    }

}
