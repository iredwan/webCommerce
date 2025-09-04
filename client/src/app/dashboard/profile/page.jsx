"use client";
import React from "react";
import { useGetUserQuery } from "@/features/user/userApiSlice";
import CRUDUserForm from "@/components/CRUDUserForm";

const ProfilePage = () => {
	// Fetch current user profile
	const { data, error, isLoading, isFetching } = useGetUserQuery();

	if (isLoading || isFetching) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-500 mt-10">
				Failed to load profile. Please try again later.
			</div>
		);
	}

	// Pass user data to CRUDUserForm in edit mode
	return (
		<div className="py-8">
			<CRUDUserForm 
            editMode={true} 
            userData={data?.data}
            isUserProfile={true} />
		</div>
	);
};

export default ProfilePage;
