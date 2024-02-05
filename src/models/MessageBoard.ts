import {User} from "./User";

/**
 * 留言板实体类接口
 */
export interface MessageBoard {
    // 留言板 ID
    messageBoardId: number;
    // 宿舍楼 ID
    dormitoryId: number,
    // 用户 ID
    userId: number,
    // 留言内容
    content: string,
    // 留言发布时间
    createDate: string,
    // 是否置顶
    top: boolean,
    // 发布留言的用户实体类
    user: User
}