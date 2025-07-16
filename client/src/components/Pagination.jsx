import ReactPaginate from 'react-paginate';

export default function Pagination({ pageCount, onPageChange, currentPage = 0 }) {
  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      pageCount={pageCount}
      onPageChange={onPageChange}
      forcePage={currentPage}
      containerClassName="flex justify-center items-center gap-1 mt-12 select-none"
      pageClassName="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-background text-white hover:scale-105 cursor-pointer"
      pageLinkClassName="w-full h-full flex items-center justify-center"
      activeClassName="bg-primary text-white shadow-md"
      activeLinkClassName="font-medium"
      breakLabel={
        <span className="w-10 h-10 flex items-center justify-center text-gray-500">
          ...
        </span>
      }
      previousLabel={
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:scale-105 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      }
      nextLabel={
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:scale-105 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      }
      previousClassName="hover:scale-105 transition-transform"
      nextClassName="hover:scale-105 transition-transform"
      disabledClassName="opacity-50 cursor-not-allowed"
      disabledLinkClassName="cursor-not-allowed"
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
      renderOnZeroPageCount={null}
    />
  );
}
