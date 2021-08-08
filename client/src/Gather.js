
import {useEffect} from 'react';

function Gather() {
  useEffect(()=>{
    console.log('howdy')
  })

  return (
    <div className="App">

      <div className="title">
        <h1>gather</h1>
        </div>
      <button className="button-begin">choose</button>
  	</div>
  );
}

export default Gather;
