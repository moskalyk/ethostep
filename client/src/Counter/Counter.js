import react, {useState,useEffect} from 'react'

import './counter.css'

function Counter(props){
  const [count, setCount] = useState(0)
  const [dataCount, setDataCount] = useState(0)

  useEffect(() => {
    const interval = setInterval((count) => {

      // call service to compute new step, pass in frequency as input
      // take computation of data amount then pass into count set
      // recieve from nodes their data and frequency sets
      setCount(count + 1)

    }, 1000, count);
    return () => clearInterval(interval);
  }, [count]);
  
  const increment = () => {
    setCount(count + 1)
  }
  
  const reset = () => {
    setCount(0)
  }  

   return(
     <div>
       <div className="counters">
        <span><h2 style={{fontFamily: '"Major Mono Display", monospace !important'}}>{dataCount} kb/s 💽</h2></span>
        <span><h2>&nbsp;&nbsp;:&nbsp;&nbsp;</h2></span>
        <span><h2 style={{fontFamily: '"Major Mono Display", monospace !important'}}>{count} 🌱</h2></span>
       </div>
      <button id="inc" onClick={increment}>+1</button>
      <button id="reset" onClick={reset}>Reset</button>
     </div>
   );
} 

export default Counter