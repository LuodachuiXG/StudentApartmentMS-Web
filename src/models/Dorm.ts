import { User } from "./User";

/**
 * 宿舍楼实体类接口
 */
export interface Dorm {
    dormitoryId: number;
    name: string;
    headCount: string;
    admins: Array<User>;
}