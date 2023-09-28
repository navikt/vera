import { Suspense } from "react"
import LogTable from "./logTable"

// This component passed as fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function LogPageFallback() {
  return <>Loading...</>
}

export default async function LogPage() {
  return (
    <>
    <Suspense fallback={<LogPageFallback />}> 
      <LogTable/>
    </Suspense>
    </>
  )
}
