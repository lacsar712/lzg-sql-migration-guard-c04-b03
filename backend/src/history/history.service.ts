import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AnalyzeResult } from '../common/types';
import { AnalysisHistory } from './history.entity';

export interface HistoryListParams {
  dialect?: string;
  ok?: boolean;
  page?: number;
  pageSize?: number;
}

export interface HistoryListResult {
  items: AnalysisHistory[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(AnalysisHistory)
    private readonly repo: Repository<AnalysisHistory>,
  ) {}

  async save(
    result: AnalyzeResult,
    sqlFull: string,
    username?: string,
  ): Promise<AnalysisHistory> {
    const entity = this.repo.create({
      sqlSummary: result.sqlSummary,
      sqlFull,
      dialect: result.dialect,
      ok: result.ok,
      findingsJson: result.findings,
      username: username || undefined,
    });
    return this.repo.save(entity);
  }

  async list(params: HistoryListParams = {}): Promise<HistoryListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where: FindOptionsWhere<AnalysisHistory> = {};
    if (params.dialect) where.dialect = params.dialect;
    if (typeof params.ok === 'boolean') where.ok = params.ok;

    // 稳定分页：先按创建时间倒序，同一时刻再以 id（uuid）升序兜底，
    // 保证新数据写入时翻页不重不漏。
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async getById(id: string): Promise<AnalysisHistory | null> {
    return this.repo.findOne({ where: { id } });
  }
}
