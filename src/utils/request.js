import axios from "axios";
import { MessageBox, Message } from "element-plus";
import store from "@/store";
import { getToken } from "@/utils/auth";

// 读取了 .env[mode] 的配置，不使用这个定义baseURL
// const baseURL =
//   process.env.NODE_ENV === "production"
//     ? "http://ustbhuangyi.com/music-next/"
//     : "/";

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VITE_APP_BASE_URL, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // 请求超时时间
});

// 请求拦截
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers["X-Token"] = getToken();
    }

    if (config.methods === "post") {
      config.headers[""] = "";
    }

    // * 根据访问url的路径不同，添加不同响应头
    // if (config.url.includes("pageNum=1&pageSize=10&type=1&k=9709153")) {
    //   config.headers["X-Host"] = "mall.film-ticket.film.list";
    // } else if (config.url.includes("cityId=330100&ticketFlag=1&k=7878846")) {
    //   config.headers["X-Host"] = "mall.film-ticket.cinema.list";
    // }

    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || "Error",
        type: "error",
        duration: 5 * 1000,
      });

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm(
          "You have been logged out, you can cancel to stay on this page, or log in again",
          "Confirm logout",
          {
            confirmButtonText: "Re-Login",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    console.log("err" + error); // for debug
    Message({
      message: error.message,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default service;
