import  axios from 'axios';

const API =axios.create({
    baseURL: "https://loan-management-system-kpvw.onrender.com"
});

// har request mein token automatically lagao
API.interceptors.request.use((req)=>{
    const token=localStorage.getItem('token');
    if(token){
        req.headers.Authorization=`Bearer ${token}`;
    }
    return req;

});

export default API;
