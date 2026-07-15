import { FormHelperText, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation} from '../../../assets'
import {useDispatch,useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser,loginAsync,selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import {MotionConfig, motion} from 'framer-motion'
import { Navbar } from '../../navigation/components/Navbar'

export const Login = () => {
  const dispatch=useDispatch()
  const status=useSelector(selectLoginStatus)
  const error=useSelector(selectLoginError)
  const loggedInUser=useSelector(selectLoggedInUser)
  const {register,handleSubmit,reset,formState: { errors }} = useForm()
  const navigate=useNavigate()
  const theme=useTheme()
  const is900=useMediaQuery(theme.breakpoints.down(900))
  const is480=useMediaQuery(theme.breakpoints.down(480))
  
  // handles user redirection
  useEffect(()=>{
    if(loggedInUser){
      navigate("/")
    }
  },[loggedInUser])

  // handles login error and toast them
  useEffect(()=>{
    if(error){
      toast.error(error.message)
    }
  },[error])

  // handles login status and dispatches reset actions to relevant states in cleanup
  useEffect(()=>{
    if(status==='fullfilled' && loggedInUser){
      toast.success('Login successful')
      reset()
    }
    return ()=>{
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  },[status])

  const handleLogin=(data)=>{
    const cred={...data}
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <>
      <Navbar />
      <Stack
        width="100%"
        minHeight="calc(100vh - 4rem)"
        px={{ xs: 2, md: 5 }}
        py={{ xs: 4, md: 6 }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="center"
        alignItems="center"
        spacing={3}
      >
        {!is900 && (
          <Stack sx={{ flex: 1, width: '100%', maxWidth: 420 }} justifyContent="center" alignItems="center">
            <Lottie animationData={ecommerceOutlookAnimation} />
          </Stack>
        )}

        <Paper elevation={3} sx={{ p: 4, width: is480 ? '95vw' : '28rem', borderRadius: 3 }}>
          <Stack spacing={1.5}>
            <Stack alignItems="center" spacing={0.5}>
              <Typography variant="h4" fontWeight={900}>
                Mern Shop
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Shop Anything
              </Typography>
            </Stack>

            <Stack spacing={2} component={'form'} noValidate onSubmit={handleSubmit(handleLogin)}>
              <motion.div whileHover={{ y: -5 }}>
                <TextField
                  fullWidth
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value:
                        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                      message: 'Enter a valid email',
                    },
                  })}
                  placeholder="Email"
                />
                {errors.email && (
                  <FormHelperText sx={{ mt: 1 }} error>
                    {errors.email.message}
                  </FormHelperText>
                )}
              </motion.div>

              <motion.div whileHover={{ y: -5 }}>
                <TextField type="password" fullWidth {...register('password', { required: 'Password is required' })} placeholder="Password" />
                {errors.password && (
                  <FormHelperText sx={{ mt: 1 }} error>
                    {errors.password.message}
                  </FormHelperText>
                )}
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <LoadingButton fullWidth sx={{ height: '2.5rem' }} loading={status === 'pending'} type="submit" variant="contained">
                  Login
                </LoadingButton>
              </motion.div>

              <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>
                <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
                  <motion.div>
                    <Typography mr={'1.5rem'} sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }} to={'/forgot-password'} component={Link}>
                      Forgot password
                    </Typography>
                  </motion.div>
                </MotionConfig>

                <motion.div>
                  <Typography sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }} to={'/signup'} component={Link}>
                    Don't have an account? <span style={{ color: theme.palette.primary.dark }}>Register</span>
                  </Typography>
                </motion.div>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}
