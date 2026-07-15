import { useSelector } from 'react-redux';
import {
  Navigate,
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements
} from "react-router-dom";
import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice';
import { Logout } from './features/auth/components/Logout';
import { Protected } from './features/auth/components/Protected';
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AddProductPage, AdminOrdersPage, CartPage, CheckoutPage, ContactPage, FaqPage, ForgotPasswordPage, HomePage, LoginPage, OrderSuccessPage, OtpVerificationPage, PrivacyPolicyPage, ProductDetailsPage, ProductUpdatePage, ResetPasswordPage, SignupPage, TermsOfUsePage, UserOrdersPage, UserProfilePage, WishlistPage } from './pages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminBrandsPage } from './pages/AdminBrandsPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { NotFoundPage } from './pages/NotFoundPage';


function App() {

  const isAuthChecked=useSelector(selectIsAuthChecked)
  const loggedInUser=useSelector(selectLoggedInUser)


  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);


  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/verify-otp' element={<OtpVerificationPage/>}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
        <Route path='/reset-password/:userId/:passwordResetToken' element={<ResetPasswordPage/>}/>
        <Route exact path='/logout' element={<Protected><Logout/></Protected>}/>
        <Route exact path='/product-details/:id' element={<ProductDetailsPage/>}/>
        <Route path='/privacy-policy' element={<PrivacyPolicyPage/>} />
        <Route path='/terms-of-use' element={<TermsOfUsePage/>} />
        <Route path='/faq' element={<FaqPage/>} />
        <Route path='/contact' element={<ContactPage/>} />

        {
          loggedInUser?.isAdmin?(
            // admin routes
            <>
            <Route path='/admin/dashboard' element={<Protected><AdminDashboardPage/></Protected>}/>
            <Route path='/admin/products' element={<Protected><AdminProductsPage/></Protected>}/>
            <Route path='/admin/product-update/:id' element={<Protected><ProductUpdatePage/></Protected>}/>
            <Route path='/admin/add-product' element={<Protected><AddProductPage/></Protected>}/>
            <Route path='/admin/orders'  element={<Protected><AdminOrdersPage/></Protected>}/>
            <Route path='/admin/users' element={<Protected><AdminUsersPage/></Protected>}/>
            <Route path='/admin/brands' element={<Protected><AdminBrandsPage/></Protected>}/>
            <Route path='/admin/categories' element={<Protected><AdminCategoriesPage/></Protected>}/>
            <Route path='*' element={<Navigate to={'/admin/dashboard'}/>}/>
            </>
          ):(
            // user routes
            <>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/cart' element={<Protected><CartPage/></Protected>}/>
            <Route path='/profile' element={<Protected><UserProfilePage/></Protected>}/>
            <Route path='/checkout' element={<Protected><CheckoutPage/></Protected>}/>
            <Route path='/order-success/:id' element={<Protected><OrderSuccessPage/></Protected>}/>
            <Route path='/orders' element={<Protected><UserOrdersPage/></Protected>}/>
            <Route path='/wishlist' element={<Protected><WishlistPage/></Protected>}/>
            </>
          )
        }

        <Route path='*' element={<NotFoundPage/>} />

      </>
    )
  )

  
  return isAuthChecked ? <RouterProvider router={routes}/> : "";
}

export default App;
