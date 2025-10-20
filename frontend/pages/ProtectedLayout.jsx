import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const ProtectedLayout = () => {
    return (
        <div className="app">
            <Sidebar />
            <div className="content">
                <div className="content__inner h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default ProtectedLayout
