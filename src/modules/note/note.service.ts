import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const createdNote = new this.noteModel({
      ...createNoteDto,
      user: new Types.ObjectId(userId),
    });
    return createdNote.save();
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel.find({ user: new Types.ObjectId(userId) }).exec();
  }

  async findOne(userId: string, id: string): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Nota não encontrada');
    }
    const note = await this.noteModel
      .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId) })
      .exec();
    if (!note) {
      throw new NotFoundException('Nota não encontrada');
    }
    return note;
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Nota não encontrada');
    }
    const note = await this.noteModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), user: new Types.ObjectId(userId) },
        updateNoteDto,
        { new: true },
      )
      .exec();
    if (!note) {
      throw new NotFoundException('Nota não encontrada');
    }
    return note;
  }

  async remove(userId: string, id: string): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Nota não encontrada');
    }
    const note = await this.noteModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId) })
      .exec();
    if (!note) {
      throw new NotFoundException('Nota não encontrada');
    }
    return note;
  }
}
