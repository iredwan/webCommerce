'use client'
import { useParams } from 'next/navigation'
import { useGetUserByIdQuery } from '@/features/user/userApiSlice'
import AddUserForm from '@/components/CRUDUserForm'
 
export default function UserDetailsPage() {
  const { id } = useParams()
  const { data: getUserData, isLoading, isError, error } = useGetUserByIdQuery(id)
  const userData = getUserData?.data || {}
   if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return <p>Error fetching user data: {error.message}</p>
  }

  return (
    <div>
      <AddUserForm 
      editMode={true}
      userData={userData} />
    </div>
  )
}
