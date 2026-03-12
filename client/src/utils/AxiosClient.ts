import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(config =>{
  const token = localStorage.getItem("token");
  if(token)
    config.headers.Authorization = `Bearer ${token}`;
  return config
});

axiosClient.interceptors.response.use(
  function handleSucess(response){
    return response
  },
  function handleError(error){
    const status = error.response?.status;
    if(status === 401 || status === 403)
    {
       localStorage.removeItem("token");
       localStorage.removeItem("user");
      //  window.location.href = "/login";
    }
  return Promise.reject(error);
  }
);

export default axiosClient;
