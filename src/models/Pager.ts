/**
 * 分页数据实体类
 */
export interface Pager<T> {
    // 当前页
    page: number;
    // 每页大小
    size: number;
    // 数据集合
    data: Array<T>;
    // 总数据数
    totalData: number;
    // 总页数
    totalPage: number;
}