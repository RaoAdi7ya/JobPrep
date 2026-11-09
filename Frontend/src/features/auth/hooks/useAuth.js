import {useContext, useEffect} from 'react'
import {AuthContext} from '../auth.contex.jsx'
import { login, register, logout, getMe } from '../services/auth.api.js'


export const useAuth = () => {
    const context  = useContext(AuthContext)
    const {user, loading, setUser, setLoading} = context  

  
       const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return true
        } catch (error) {
            console.error('Login error:', error)
            return false
        } finally {
            setLoading(false)
        }
    }
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return true
        } catch (error) {
            console.error('Register error:', error)
            return false
        } finally {
            setLoading(false)
        }
    }
    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setLoading(false)
        }
    }


     useEffect(() => {
       const getAndSetUser = async () => {
         try {
           const data = await getMe();
           setUser(data.user);
         } catch (err) {
           // 401 in incognito is normal: it just means nobody is logged in yet
           setUser(null);
         } finally {
           // This will ALWAYS run, turning off the loading screen
           setLoading(false);
         }
       };

       getAndSetUser();
     }, []);

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    }
    
    

}