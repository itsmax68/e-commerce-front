import React, { useEffect } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { ProductBanner } from '../features/products/components/ProductBanner'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import {Footer} from '../features/footer/Footer'
import { CategoryCollections } from '../features/home/components/CategoryCollections'
import { banner1, banner2, banner3, banner4 } from '../assets'

export const HomePage = () => {

  const dispatch=useDispatch()
  const addressStatus=useSelector(selectAddressStatus)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){

      dispatch(resetAddressStatus())
    }
  },[addressStatus])

  return (
    <>
    <Navbar isProductList={true}/>
    {/* <ProductBanner images={[banner1, banner2, banner3, banner4]} /> */}
    {/* <CategoryCollections /> */}
    <ProductList />
    <Footer/>
    </>
  )
}
