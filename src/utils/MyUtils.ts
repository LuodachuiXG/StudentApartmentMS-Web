import {ElMessage, ElMessageBox} from "element-plus";

/**
 * 将 Date 格式化为 "2024-02-21" 的格式
 */
export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
}

/**
 * 封装成功 ElMessage 消息提示
 */
export const successMsg = (msg: string) => {
    ElMessage({
        message: msg,
        duration: 2000,
        type: 'success'
    });
}

/**
 * 封装错误 ElMessage 消息提示
 */
export const errorMsg = (msg: string) => {
    ElMessage({
        message: msg,
        duration: 2000,
        type: 'error'
    });
}

/**
 * 封装警告 ElMessageBox 消息框
 */
export const warningConfirmBox = (msg: string) => {
    return ElMessageBox.confirm(
        msg,
        '温馨提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    );
}

/**
 * 封装消息 ElMessageBox 消息框
 */
export const infoConfirmBox = (msg: string) => {
    return ElMessageBox.confirm(
        msg,
        '温馨提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }
    );
}

/**
 * 封装错误 ElMessageBox 消息框
 */
export const errorConfirmBox = (msg: string) => {
    return ElMessageBox.confirm(
        msg,
        '温馨提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error',
        }
    );
}