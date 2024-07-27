import React, { useState, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faBars, faTimes, faCogs, faTable, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

function AdminLayout() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleContentClick = () => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden" onClick={handleContentClick}>
            {/* Lateral Nav */}
            <nav className={`bg-[#0071bc] text-white p-4 fixed top-16 bottom-0 lg:relative lg:translate-x-0 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:w-64 z-20`}>
                <div className="flex flex-col items-center mb-4">
                    <img
                        src="/images/administracion.png"  // Ruta de la imagen del icono del administrador
                        alt="Foto de Administrador"
                        className="rounded-full profile-image w-24 h-24 object-cover border-4 border-white"
                    />
                    <span className="mt-2">Administrador</span>
                </div>
                <ul>
                    <li className="mb-4 flex items-center hover:bg-gray-700 rounded-md p-2">
                        <Link to="/configuracion" className="flex items-center w-full">
                            <FontAwesomeIcon icon={faCogs} className="mr-2" />
                            <span>Gestión configuración</span>
                        </Link>
                    </li>
                    <li className="mb-4 flex items-center hover:bg-gray-700 rounded-md p-2">
                        <Link to="/InicioAdmin" className="flex items-center w-full">
                            <FontAwesomeIcon icon={faTable} className="mr-2" />
                            <span>Gestión tablas satélites</span>
                        </Link>
                    </li>
                    <li className="mb-4 flex items-center hover:bg-gray-700 rounded-md p-2">
                        <Link to="/gestion-u" className="flex items-center w-full">
                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            <span>Gestión de usuarios</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-auto">
                {/* Top Nav */}
                <nav className="bg-[#0071bc] text-white p-4 flex justify-between items-center w-full fixed top-0 left-0 right-0 z-30">
                    <div>
                        <span>Postúlate Admin</span>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                            <img
                                src="/images/administracion.png"  // Ruta de la imagen del icono del administrador
                                alt="Logo de Administrador"
                                className="w-8 h-8 object-cover border-2 border-white rounded-full mr-2"
                            />
                            <span className="hidden lg:inline">Administrador</span>
                            <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                        </button>
                        {dropdownOpen && (
                            <ul className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md overflow-hidden z-20">
                                
                                <li className="px-4 py-2 hover:bg-gray-200 rounded-md">
                                    <Link to="/" onClick={() => dispatch(logout())}>Cerrar Sesión</Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <button className="lg:hidden flex items-center focus:outline-none" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
                    </button>
                </nav>

                <div className="flex-1 p-4 mt-16 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
