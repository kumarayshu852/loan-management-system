import {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from  'react-router-dom';
import API from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login(){
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false);
    const {login}=useAuth();
    const navigate=useNavigate();

    const handleLogin =async(e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const res=await API.post('/auth/login',{email,password});
            login(res.data.token,res.data.user);
            toast.success('Login successful!');
            navigate('/dashboard');
        }catch(err){
            toast.error(err.response?.data?.message || 'Login failed');
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
            <div className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>

                {/*LOGO*/}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-3xl font-bold">₹</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500 mt-1">Login to your account</p>
                </div>

                {/* Form*/}
                <form onSubmit={handleLogin}>
                    {/* Email*/}
                    <div className="mb-4">
                        <label className="block tex-gray-700 font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    {/* Password*/}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your Password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    {/*Button*/}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50">
                            {loading?'Logging in...':"Login"}
                        </button>
                        {/* Register Link */}
                        <p className="text-center text-gray-500 text-sm mt-4">
                            New user?{' '}
                            <Link to="/register"
                            className="text-blue-600 font-medium hover:underline">
                                Create account
                                </Link>
                                </p>
                </form>
            </div>
        </div>
    );
}