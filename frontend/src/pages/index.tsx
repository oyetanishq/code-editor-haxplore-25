import Right from '@components/Right'
import Navbar from '../components/Navbar'
import Left from '@components/Left'
function App() {
 return(
    <>
    <nav>
    <Navbar/>
    </nav>

    <div className="main">
        <div className='flex'>
        
            <Left/>
            <Right/>
       

       
        
        </div>
    </div>

    </>
 )
}

export default App
