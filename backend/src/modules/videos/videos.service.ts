import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateVideoDto } from "./dto/create-video.dto";
import { UserRole } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadDir = path.join(process.cwd(), "uploads");

  async create(
    dto: CreateVideoDto,
    currentUser: { id: number; role: UserRole },
    video_file?: string,
    _file_size?: number,
  ) {
    const groupId = Number(dto.group_id);
    const lessonId = dto.lesson_id ? Number(dto.lesson_id) : null;

    if (currentUser.role === UserRole.TEACHER) {
      const access = await this.prisma.teachersGroup.findFirst({
        where: { teacher_id: currentUser.id, group_id: groupId },
      });
      if (!access) throw new ForbiddenException("Bu guruhga ruxsatingiz yo'q");
    }

    let actualSize: bigint | null = dto.file_size ? BigInt(dto.file_size) : null;
    let finalUrl = dto.video_url || "";

    if (video_file) {
      const filePath = path.join(this.uploadDir, video_file);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        actualSize = BigInt(stat.size);
      }
      finalUrl = video_file;
    }

    if (!finalUrl) {
      throw new BadRequestException("Video fayli yuborilmadi");
    }

    const data = await this.prisma.videos.create({
      data: {
        title: dto.title,
        description: dto.description,
        video_url: finalUrl,
        file_size: actualSize,
        group_id: groupId,
        lesson_id: lessonId,
        teacher_id:
          currentUser.role === UserRole.TEACHER ? currentUser.id : null,
        user_id: currentUser.role !== UserRole.TEACHER ? currentUser.id : null,
      },
      include: {
        lessons: { select: { id: true, topic: true, date: true } },
      },
    });

    return {
      success: true,
      data: {
        ...data,
        file_size: data.file_size ? data.file_size.toString() : null,
      },
    };
  }

  async findAllByGroup(
    groupId: number,
    currentUser: { id: number; role: UserRole },
  ) {
    if (currentUser.role === UserRole.TEACHER) {
      const access = await this.prisma.teachersGroup.findFirst({
        where: { teacher_id: currentUser.id, group_id: groupId },
      });
      if (!access) throw new ForbiddenException("Bu guruhga ruxsatingiz yo'q");
    }

    const videos = await this.prisma.videos.findMany({
      where: { group_id: groupId },
      orderBy: { created_at: "desc" },
      include: {
        lessons: { select: { id: true, topic: true, date: true } },
      },
    });

    const serialized = videos.map((v) => ({
      ...v,
      file_size: v.file_size ? v.file_size.toString() : null,
    }));

    return { success: true, data: serialized };
  }

  async remove(id: number, currentUser: { id: number; role: UserRole }) {
    const video = await this.prisma.videos.findUnique({ where: { id } });
    if (!video) throw new NotFoundException("Video topilmadi");

    if (currentUser.role === UserRole.TEACHER) {
      if (video.teacher_id !== currentUser.id) {
        throw new ForbiddenException("Siz bu videoni o'chira olmaysiz");
      }
    }

    const localFilename = this.extractFilename(video.video_url);
    if (localFilename) {
      const filePath = path.join(this.uploadDir, localFilename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore file system cleanup errors
        }
      }
    }

    await this.prisma.videos.delete({ where: { id } });
    return { success: true, message: "Video o'chirildi" };
  }

  private extractFilename(videoUrl: string | null | undefined): string | null {
    if (!videoUrl) return null;

    if (!videoUrl.startsWith("http")) {
      return videoUrl.replace(/^\/+/, "");
    }

    const fileMatch = videoUrl.match(/\/file\/([^/?#]+)/i);
    if (fileMatch?.[1]) {
      return decodeURIComponent(fileMatch[1]);
    }

    return null;
  }
}
