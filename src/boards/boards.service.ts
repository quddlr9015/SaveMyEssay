import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { BoardStatus } from './board-status.enum';
import { CreateBoardDto } from './dto/CreateBoard';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardRepository)
        private boardRepository: BoardRepository) {}

    async getAllBoards(): Promise<Board[]> {
        return this.boardRepository.find();
    }

    createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
        return this.boardRepository.createBoard(createBoardDto);
    }

    async findBoardById(id: number): Promise<Board> {
        const found = await this.boardRepository.findOne({ where: { id } });
        if (!found) {
            throw new NotFoundException(`Board with ID "${id}" not found`);
        }
        return found;
    }

    async deleteBoard(id: number): Promise<void> {
        const result = await this.boardRepository.delete(id);
        
        if (result.affected === 0) {
            throw new NotFoundException(`Board with ID "${id}" not found`);
        }
    }

    async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
        const board = await this.findBoardById(id);
        board.status = status;
        await this.boardRepository.save(board);
        return board;
    }
} 
