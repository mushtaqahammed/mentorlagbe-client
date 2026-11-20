"use client"

import { Bounce, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

/**
 * Global toast viewport. Mounted once in the root layout so every route
 * (marketing, auth and dashboard) shares the same notification container.
 *
 * Styled to match the site's dark neutral surfaces and lime/rose/sky/amber
 * accents without changing any existing page design.
 */
export function AppToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      theme="dark"
      autoClose={4000}
      limit={4}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      draggable
      hideProgressBar={false}
      transition={Bounce}
      className="mentorlagbe-toasts"
      toastClassName="mentorlagbe-toast"
      aria-label="Notifications"
    />
  )
}
