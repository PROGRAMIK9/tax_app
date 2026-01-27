import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import api from '../api/axios';

const Dashboard = () =>{
    const [user,setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(()=>{
        api.get('/auth/me').then((res)=>{
            setUser(res.data);
        }).catch((err)=>{
            navigate('/login');
        });
    },[]);
    const handleLogout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');    
    }
    if(!user){
        return(<div> Loading Profile.... </div>);
    }
    return(
        <div>
            <h1>Welcome to your Dashboard, {user.full_name}!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;