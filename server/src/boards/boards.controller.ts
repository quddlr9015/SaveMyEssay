import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { BoardStatus } from './board-status.enum';
import { CreateBoardDto } from './dto/CreateBoard';
import { BoardStatusValidationPipe } from './pipes/BoardStatusValidationPipe';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/auth/user.entity';
import { GetUser } from '@/auth/decorators/get-user.decorator';

@Controller('boards')
@UseGuards(AuthGuard())
export class BoardsController {
    private logger = new Logger('BoardsController');
    constructor(private boardsService: BoardsService) { };

    @Get('/')
    getAllBoards(@GetUser() user): Promise<Board[]> {
        this.logger.verbose(`User ${user.username} trying to get all boards`);
        return this.boardsService.getAllBoards(user);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    createBoard(
        @Body() createBoardDto: CreateBoardDto,
        @GetUser() user: User
    ): Promise<Board> {
        this.logger.verbose(`User ${user.username} trying to create new board.
            Payload: ${JSON.stringify(createBoardDto)}`);
        return this.boardsService.createBoard(createBoardDto, user);
    }

    @Get('/:id')
    getBoardById(@Param('id', ParseIntPipe) id: number): Promise<Board> {
        return this.boardsService.findBoardById(id);
    }

    @Delete('/:id')
    deleteBoard(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<void> {
        return this.boardsService.deleteBoard(id, user);
    }

    @Patch('/:id/status')
    updateBoardStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', BoardStatusValidationPipe) status: BoardStatus
    ): Promise<Board> {
        return this.boardsService.updateBoardStatus(id, status);
    }
}

