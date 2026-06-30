import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { userId_name: { userId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);
    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { userId_name: { userId, name: dto.name } },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
