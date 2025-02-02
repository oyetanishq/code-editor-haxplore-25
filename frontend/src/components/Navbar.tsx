
const Navbar = ({ code }: {code: string;}) => {
  return (
    <nav className='bg-[#7676ea] w-full h-16 flex justify-between items-center'>
        <div className="mx-4 text-[34px] font-bold">Code Editor</div>
        <code className="box mx-4 text-white uppercase underline underline-offset-2 cursor-pointer">{code}</code>
    </nav>
  )
}

export default Navbar
