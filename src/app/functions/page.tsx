import Functions from '@/components/functions'
import FunctionsSidebar from '@/components/functions/FunctionsSidebar';

import React from 'react'

const page = () => {
  return (
    <div className='flex '>
      <FunctionsSidebar />
      <div className='p-4 w-full'>
      <Functions />
      </div>
    </div>
  )
}

export default page