import { Suspense } from "react";
import VeraTable from "./veraTable";

// This component passed as fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function VeraTableFallback() {
  return <>Loading...</>
}

export default async function Page() {
  
  return (
    <>
      <Suspense fallback={<VeraTableFallback />}>
        <VeraTable/>
        </Suspense>
    </>
  )
}