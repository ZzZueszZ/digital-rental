declare global {
  interface IPagination {
    pageNumber: number
    pageSize: number
    totalPages: number
    totalElements: number
  }

  interface IBackendRes<T> {
    statusCode: number
    message: string
    success: boolean
    data?: T
    pagination?: IPagination
  }
}

export type { IBackendRes }
