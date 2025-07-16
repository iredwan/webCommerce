import Swal from 'sweetalert2';

const deleteConfirm = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone!',
  confirmButtonText = 'Yes, delete it!',
  cancelButtonText = 'Cancel',
  icon = 'warning'
} = {}) => {
  try {
    const result = await Swal.fire({
  title,
  text,
  icon,
  showCancelButton: true,
  confirmButtonText,
  cancelButtonText,
  confirmButtonColor: '#ef4444',
  cancelButtonColor: '#6b7280',
  reverseButtons: true,
  focusCancel: true,
  customClass: {
    confirmButton: 'swal2-confirm-custom',
    cancelButton: 'swal2-cancel-custom',
  },
});

    return result.isConfirmed;
  } catch (error) {
    console.error('Error showing delete confirmation:', error);
    return false;
  }
};

export default deleteConfirm;
