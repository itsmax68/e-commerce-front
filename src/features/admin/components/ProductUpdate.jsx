import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync,resetProductUpdateStatus, selectProductUpdateStatus, selectSelectedProduct, updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'

const MAX_IMAGE_SLOTS = 12

export const ProductUpdate = () => {

    const {register,handleSubmit,reset} = useForm()

    const {id}=useParams()
    const dispatch=useDispatch()
    const selectedProduct=useSelector(selectSelectedProduct)
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const productUpdateStatus=useSelector(selectProductUpdateStatus)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))


    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
        }
    },[id])

    useEffect(() => {
        if (!selectedProduct?._id) return
        const imgs = selectedProduct.images || []
        const defaults = {
            title: selectedProduct.title,
            brand: selectedProduct.brand?._id || selectedProduct.brand,
            category: selectedProduct.category?._id || selectedProduct.category,
            description: selectedProduct.description,
            price: selectedProduct.price,
            discountPercentage: selectedProduct.discountPercentage,
            stockQuantity: selectedProduct.stockQuantity,
            thumbnail: selectedProduct.thumbnail || '',
        }
        for (let i = 0; i < MAX_IMAGE_SLOTS; i++) {
            defaults[`image${i}`] = imgs[i] || ''
        }
        reset(defaults)
    }, [selectedProduct, reset])

    useEffect(()=>{
        if(productUpdateStatus==='fullfilled'){
            toast.success("Product Updated")
            navigate("/admin/products")
        }
        else if(productUpdateStatus==='rejected'){
            toast.error("Error updating product, please try again later")
        }
    },[productUpdateStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductUpdateStatus())
        }
    },[])

    const handleProductUpdate=(data)=>{
        const imageUrls = []
        for (let i = 0; i < MAX_IMAGE_SLOTS; i++) {
            const v = data[`image${i}`]
            if (v != null && String(v).trim() !== '') imageUrls.push(String(v).trim())
        }

        const productUpdate = { ...data, _id: selectedProduct._id, images: imageUrls }
        for (let i = 0; i < MAX_IMAGE_SLOTS; i++) delete productUpdate[`image${i}`]

        const thumb = data.thumbnail != null ? String(data.thumbnail).trim() : ''
        productUpdate.thumbnail = thumb || imageUrls[0] || selectedProduct.thumbnail || ''
        productUpdate.price = Number(data.price)
        productUpdate.discountPercentage = Number(data.discountPercentage)
        productUpdate.stockQuantity = Number(data.stockQuantity)

        dispatch(updateProductByIdAsync(productUpdate))
    }


  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >
        
        {
            selectedProduct &&
        
        <Stack key={selectedProduct._id} width={is1100?"100%":"60rem"} rowGap={4} mt={is480?4:6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleProductUpdate)}> 
            
            {/* feild area */}
            <Stack rowGap={3}>
                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Title</Typography>
                    <TextField {...register("title",{required:'Title is required'})}/>
                </Stack> 

                <Stack flexDirection={'row'} >

                    <FormControl fullWidth>
                        <InputLabel id="brand-selection">Brand</InputLabel>
                        <Select {...register("brand",{required:"Brand is required"})} labelId="brand-selection" label="Brand">
                            
                            {
                                brands.map((brand)=>(
                                    <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>


                    <FormControl fullWidth>
                        <InputLabel id="category-selection">Category</InputLabel>
                        <Select {...register("category",{required:"category is required"})} labelId="category-selection" label="Category">
                            
                            {
                                categories.map((category)=>(
                                    <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>

                </Stack>


                <Stack>
                    <Typography variant='h6' fontWeight={400}  gutterBottom>Description</Typography>
                    <TextField multiline rows={4} {...register("description",{required:"Description is required"})}/>
                </Stack>

                <Stack flexDirection={'row'}>
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>Price</Typography>
                        <TextField type='number' {...register("price",{required:"Price is required"})}/>
                    </Stack>
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>Discount {is480?"%":"Percentage"}</Typography>
                        <TextField type='number' {...register("discountPercentage",{required:"discount percentage is required"})}/>
                    </Stack>
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Stock Quantity</Typography>
                    <TextField type='number' {...register("stockQuantity",{required:"Stock Quantity is required"})}/>
                </Stack>
                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Thumbnail (optional)</Typography>
                    <TextField placeholder="Leave empty to keep or use first image URL" {...register("thumbnail")}/>
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Product images (optional)</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Edit URLs or leave slots empty. Clearing all removes gallery images; thumbnail above can still show a main image.
                    </Typography>

                    <Stack rowGap={2}>
                        {Array.from({ length: MAX_IMAGE_SLOTS }).map((_, index) => (
                            <TextField
                                key={index}
                                placeholder={`Image URL ${index + 1} (optional)`}
                                {...register(`image${index}`)}
                            />
                        ))}
                    </Stack>

                </Stack>

            </Stack>


            {/* action area */}
            <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480?1:2}>
                <Button size={is480?'medium':'large'} variant='contained' type='submit'>Update</Button>
                <Button size={is480?'medium':'large'} variant='outlined' color='error' component={Link} to={'/admin/products'}>Cancel</Button>
            </Stack>


        </Stack>
        }

    </Stack>
  )
}
