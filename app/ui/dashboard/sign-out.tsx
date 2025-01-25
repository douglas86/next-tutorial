"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/app/ui/button"

export default function LogoutButton() {
  return (
      <Button onClick={() => signOut()}>
        <svg mlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
        </svg>
      </Button>
  )
}
