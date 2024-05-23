import React from 'react'
import { auth } from '@/auth'
async function page() {
const user = await auth()
// console.log(user, "from server component")
  return (
    <div>{JSON.stringify(user)}</div>
  )
}

export default page