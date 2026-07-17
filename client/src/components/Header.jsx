
export default function Header() {

    return <header className="flex justify-between items-center p-4 border-2">
        <a href="/" className='font-bold text-2xl transition-all hover:scale-110'>Ambiance</a>

        <div className="flex gap-4">
            <a href="/inscription">Inscription</a>
            <a href="/connection">Connection</a>
        </div>
    </header>
}