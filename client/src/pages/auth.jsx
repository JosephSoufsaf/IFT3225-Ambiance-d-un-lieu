import { Outlet } from "react-router"

export default function Auth() {
    return <div className="flex flex-col align-middle">
        <h1 className="text-center text-2xl m-4 underline">Authentification</h1>
        <Outlet />
    </div>
}