import VeraTable from "./veraTable";

export default async function Page({
  searchParams
}: {
  searchParams: {"apps"?: string, "envs"?:string}
}) {
  
  return (
    <>
      <VeraTable searchparams={searchParams}/>
    </>
  )
}