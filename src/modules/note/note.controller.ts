import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@ApiTags('notes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova nota' })
  async create(@Req() req: AuthenticatedRequest, @Body() createNoteDto: CreateNoteDto) {
    return this.noteService.create(req.user.userId, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as notas do usuário' })
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.noteService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma nota específica' })
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noteService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma nota' })
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.noteService.update(req.user.userId, id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma nota' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noteService.remove(req.user.userId, id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Marcar uma nota como favorita' })
  async favorite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.noteService.toggleFavorite(req.user.userId, id);
  }
}
