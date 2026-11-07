import {useContext} from 'react'
import {AuthContext} from '../auth.contex.jsx'
import { login, register, logout, getMe } from '../services/auth.api.js'


export const useAuth = () => {
    const context  = useContext(AuthContext)
    const {user, loading, setUser, setLoading} = context  



    const handleLogin = async ({email, password}) => {
        setLoading(true)
    }
    
    

}