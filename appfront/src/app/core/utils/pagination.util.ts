export class PaginationUtil {
  static getPaginatedSlice<T>(items: T[], currentPage: number, pageSize: number): { paginated: T[]; totalPages: number } {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * pageSize;
    return {
      paginated: items.slice(start, start + pageSize),
      totalPages
    };
  }

  static getPageNumbers(currentPage: number, totalPages: number, delta = 2): number[] {
    const pages: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }
}
