import axios, {AxiosRequestHeaders} from "axios";

// 创建 axios 实例
const service = axios.create({
    baseURL: "http://localhost:8099",
    timeout: 5000,
    headers: {
        "Content-type": "application/json;charset=utf-8"
    }
})

// 请求拦截，在请求发送前加上 Token
service.interceptors.request.use((config) => {
    // 确保headers对象已初始化
    config.headers = config.headers || {} as AxiosRequestHeaders;
    // 检查用户是否已登录（即 localStorage 中有无 token）
    const token = localStorage.getItem("token");
    // 如果存在 token，则将其设置到请求头中
    if (token) {
        config.headers.token = token;
    }
    // 必须返回 config，以便请求能发出
    return config;

}, error => {
    // 处理错误请求
    return Promise.reject(error);
});



// 响应拦截：后端返回来的结果
service.interceptors.response.use((res) => {
    // code 是后端的状态码
    const code: number = res.data.code
    if (code == 200) {
        // 请求成功
        return Promise.resolve(res.data)
    } else if (code == 401) {
        // 未登录或 Token 过期

    } else {
        // 请求失败
        return Promise.reject(res)
    }
}, (err) => {
    // 错误信息的处理
    console.log(err)
    // 处理错误响应
    return Promise.reject(err)
})

export default service
