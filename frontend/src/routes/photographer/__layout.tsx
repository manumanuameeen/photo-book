import { createFileRoute } from '@tanstack/react-router' 
import { Outlet } from '@tanstack/react-router'
import Footer from '../../layouts/user/Footer'
import Header from '../../layouts/user/Header'

export const Route = createFileRoute('/photographer/__layout')({
    component: () => ( 
        <div className='min-h-screen flex flex-col'>
            <Header />
            <main className='flex-grow'>
                <Outlet />
            </main>
            <Footer />
        </div>
    ) 
})
