import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NoteService } from './note.service';
import { Note } from './note.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('NoteService', () => {
  let service: NoteService;
  const userId = '507f191e810c19729de860ea';
  const noteId = new Types.ObjectId().toHexString();
  const mockNote = {
    _id: noteId,
    title: 'Test Note',
    description: 'Test Description',
    user: new Types.ObjectId(userId),
  };
  const updateNoteDto = {
    title: 'Updated Note',
    description: 'Updated Description',
  };

  const noteModelMock: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
      _id: noteId,
      title: data.title,
      description: data.description,
      user: new Types.ObjectId(userId),
    }),
  }));
  noteModelMock.find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockNote]),
  });
  noteModelMock.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockNote),
  });
  noteModelMock.findOneAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: noteId,
      title: updateNoteDto.title,
      description: updateNoteDto.description,
      user: new Types.ObjectId(userId),
    }),
  });
  noteModelMock.findOneAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockNote),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: getModelToken(Note.name),
          useValue: noteModelMock,
        },
      ],
    }).compile();
    service = module.get<NoteService>(NoteService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma nota com descrição válida', async () => {
      const createNoteDto = { title: 'Test Note', description: 'Test Description' };
      const result = await service.create(userId, createNoteDto);
      expect(result).toEqual({
        _id: noteId,
        title: createNoteDto.title,
        description: createNoteDto.description,
        user: expect.any(Types.ObjectId),
      });
      expect(noteModelMock).toHaveBeenCalledWith({
        ...createNoteDto,
        user: new Types.ObjectId(userId),
      });
    });

    it('deve criar uma nota com descrição em branco', async () => {
      const createNoteDto = { title: 'Test Note', description: '' };
      const result = await service.create(userId, createNoteDto);
      expect(result.description).toEqual('');
    });

    it('deve lançar erro se o título estiver em branco', async () => {
      const createNoteDto = { title: '', description: 'Test Description' };
      const error = new Error('Validation failed: title is required');
      noteModelMock.mockImplementationOnce((data) => ({
        ...data,
        save: jest.fn().mockRejectedValue(error),
      }));
      await expect(service.create(userId, createNoteDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as notas do usuário', async () => {
      const result = await service.findAll(userId);
      expect(result).toEqual([mockNote]);
      expect(noteModelMock.find).toHaveBeenCalledWith({ user: new Types.ObjectId(userId) });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma nota existente', async () => {
      const result = await service.findOne(userId, noteId);
      expect(result).toEqual(mockNote);
      expect(noteModelMock.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(noteId),
        user: new Types.ObjectId(userId),
      });
    });

    it('deve lançar NotFoundException se a nota não for encontrada', async () => {
      noteModelMock.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne(userId, noteId)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException para id inválido em findOne', async () => {
      await expect(service.findOne(userId, '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma nota existente', async () => {
      const result = await service.update(userId, noteId, updateNoteDto);
      expect(result).toEqual({
        _id: noteId,
        title: updateNoteDto.title,
        description: updateNoteDto.description,
        user: expect.any(Types.ObjectId),
      });
      expect(noteModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(noteId), user: new Types.ObjectId(userId) },
        updateNoteDto,
        { new: true },
      );
    });

    it('deve lançar NotFoundException se tentar atualizar uma nota inexistente', async () => {
      noteModelMock.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.update(userId, noteId, updateNoteDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException para id inválido em update', async () => {
      await expect(service.update(userId, 's', updateNoteDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve excluir uma nota existente', async () => {
      const result = await service.remove(userId, noteId);
      expect(result).toEqual(mockNote);
      expect(noteModelMock.findOneAndDelete).toHaveBeenCalledWith({
        _id: new Types.ObjectId(noteId),
        user: new Types.ObjectId(userId),
      });
    });

    it('deve lançar NotFoundException se tentar excluir uma nota inexistente', async () => {
      noteModelMock.findOneAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove(userId, noteId)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException para id inválido em remove', async () => {
      await expect(service.remove(userId, 's')).rejects.toThrow(NotFoundException);
    });
  });
});
