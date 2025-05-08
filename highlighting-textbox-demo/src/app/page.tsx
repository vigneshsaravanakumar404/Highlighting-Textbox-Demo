export default function Home() {

  return (
    <div className="h-screen m-0 p-0">
      <div className="flex h-full">

        <div className="w-1/5 bg-gray-800 text-white p-4">
          <h1 className="text-lg font-semibold">Instructions</h1>
          <ol className="mt-4 list-decimal pl-5">
            <li className="mb-2">
              <p>Refresh the page to restart</p>
            </li>
            <li className="mb-2">
              <p>Fill out the information that is missing (highlighted) as directed by the chat explanation</p>
            </li>
            <li className="mb-2">
              <p>Large continued conversations might not work well</p>
            </li>
          </ol>
        </div>

        <div className="w-4/5 flex flex-col">

          <div className="h-1/2 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">Top screen (empty)</p>
          </div>

          <div className="h-1/2 bg-white border-t border-gray-300 flex items-center justify-center">
            <p className="text-gray-500">Chat box (placeholder)</p>
          </div>

        </div>

      </div>
    </div>
  );
}
