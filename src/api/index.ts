import axios, { AxiosRequestHeaders } from "axios";
import { StoreEnum } from "../models/StoreEnum";
import { useRouter } from "vue-router";
import { User } from "../models/User";
import { errorMsg } from "../utils/MyUtils";

const router = useRouter();

// 创建 axios 实例
const service = axios.create({
    baseURL: "http://127.0.0.1:8099",
    timeout: 5000,
    headers: {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
    withCredentials: true
});

// 请求拦截，在请求发送前加上 Token
service.interceptors.request.use((config) => {
    // 确保 headers 对象已初始化
    config.headers = config.headers || {} as AxiosRequestHeaders;
    // 检查用户是否已登录（即 localStorage 中有无 user）
    const _user = localStorage.getItem("user");
    // 如果存在 user，则将用户的 Token 设置到请求头中
    if (_user) {
        const user = JSON.parse(_user) as User;
        config.headers.token = user.token;
    }
    // 必须返回 config，以便请求能发出
    return config;
}, error => {
    // 处理错误请求
    return Promise.reject(error);
});


/**
 * 响应拦截：后端返回来的结果
 */
service.interceptors.response.use((res) => {
    if (res.status === 401) {
        // 未登录或 Token 过期
        tokenExpired()
        return Promise.reject(res.data);
    }
    // 请求成功
    return Promise.resolve(res.data);
}, (err) => {
    // code 是后端的状态码
    if (err.response == undefined) {
        return Promise.reject(err.message);
    }
    const code: number = err.response.data.code;
    if (code === 401) {
        // 未登录或 Token 过期
        tokenExpired()
        return Promise.reject(err.response.data);
    }
    // 处理错误响应
    return Promise.reject(err.response.data);
});

/**
 * Token 过期
 */
const tokenExpired = () => {
    // 移除用户配置信息
    localStorage.removeItem(StoreEnum.USER);
    // 跳转登录界面
    router.push(RouterView.LOGIN);
    errorMsg('登录已过期，请重新登录');
}

export default service;
