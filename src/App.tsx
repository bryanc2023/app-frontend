import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { routes } from "../src/routes/route"
import { createElement } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {


  const router = createBrowserRouter(routes.map(route => ({
    ...route,
    element: route.isProtected
        ? <ProtectedRoute allowedRoles={route.allowedRoles}>{createElement(route.element)}</ProtectedRoute>
        : createElement(route.element),
    children: route.children?.map((child) => ({
        ...child,
        element: child.isProtected
            ? <ProtectedRoute allowedRoles={child.allowedRoles}>{createElement(child.element)}</ProtectedRoute>
            : createElement(child.element),
    })),
})));

return (
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <RouterProvider router={router} />
        </PersistGate>
    </Provider>
);
}

export default App
