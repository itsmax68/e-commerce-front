import {FormHelperText, Paper, Stack, TextField, Typography, useTheme, useMediaQuery} from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation} from '../../../assets'
import {useDispatch,useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser, signupAsync,selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig , motion} from 'framer-motion'
import { Navbar } from '../../navigation/components/Navbar';

export const Signup = () => {
  const dispatch=useDispatch()
  const status=useSelector(selectSignupStatus)
  const error=useSelector(selectSignupError)
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


  // handles signup error and toast them
  useEffect(()=>{
    if(error){
      toast.error(error.message)
    }
  },[error])

  
  useEffect(()=>{
    if(status==='fullfilled'){
      toast.success("Welcome! Your account is ready. Start shopping now.")
      reset()
    }
    return ()=>{
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  },[status])

  // this function handles signup and dispatches the signup action with credentails that api requires
  const handleSignup=(data)=>{
    const cred={...data}
    delete cred.confirmPassword
    dispatch(signupAsync(cred))
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

            <Stack spacing={2} component={'form'} noValidate onSubmit={handleSubmit(handleSignup)}>
              <MotionConfig whileHover={{ y: -5 }}>
                <motion.div>
                  <TextField fullWidth {...register("name",{required:"Username is required"})} placeholder='Username'/>
                  {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
                </motion.div>

                <motion.div>
                  <TextField fullWidth {...register("email",{required:"Email is required",pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,message:"Enter a valid email"}})} placeholder='Email'/>
                  {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
                </motion.div>

                <motion.div>
                  <TextField type='password' fullWidth {...register("password",{required:"Password is required",pattern:{value:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,message:`at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters`}})} placeholder='Password'/>
                  {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
                </motion.div>
                
                <motion.div>
                  <TextField type='password' fullWidth {...register("confirmPassword",{required:"Confirm Password is required",validate:(value,fromValues)=>value===fromValues.password || "Passwords doesn't match"})} placeholder='Confirm Password'/>
                  {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
                </motion.div>
              </MotionConfig>

              <motion.div whileHover={{scale:1.020}} whileTap={{scale:1}}>
                <LoadingButton sx={{height:'2.5rem'}} fullWidth loading={status==='pending'} type='submit' variant='contained'>Signup</LoadingButton>
              </motion.div>

              <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>
                <MotionConfig whileHover={{x:2}} whileTap={{scale:1.050}}>
                  <motion.div>
                    <Typography mr={'1.5rem'} sx={{textDecoration:"none",color:"text.primary",cursor:'pointer'}} to={'/forgot-password'} component={Link}>Forgot password</Typography>
                  </motion.div>
                </MotionConfig>

                <motion.div>
                  <Typography sx={{textDecoration:"none",color:"text.primary",cursor:'pointer'}} to={'/login'} component={Link}>Already a member? <span style={{color:theme.palette.primary.dark}}>Login</span></Typography>
                </motion.div>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}
